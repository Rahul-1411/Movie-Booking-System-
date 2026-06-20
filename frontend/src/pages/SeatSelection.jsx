import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { showApi, bookingApi } from '../services/api'
import SeatMap from '../components/SeatMap'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function SeatSelection() {
  const { showId } = useParams()
  const navigate = useNavigate()

  const [layout, setLayout] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    showApi.getSeats(showId)
      .then(res => setLayout(res.data))
      .catch(() => toast.error('Failed to load seat layout'))
      .finally(() => setLoading(false))
  }, [showId])

  // Countdown timer for seat selection
  useEffect(() => {
    if (!layout) return
    const SELECTION_TIMEOUT = 5 * 60 // 5 minutes
    setTimeLeft(SELECTION_TIMEOUT)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setSelectedSeats([])
          toast.error('Seat selection timed out. Please re-select.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [layout])

  const handleSeatToggle = useCallback((seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id)
      return exists ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    })
  }, [])

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    setBooking(true)
    try {
      // ✅ Single call: backend locks seats via optimistic locking and confirms
      // the booking immediately. If another user grabbed a seat first, the
      // backend returns 409 Conflict and we refresh the layout below.
      const { data } = await bookingApi.create({
        showId: parseInt(showId),
        seatIds: selectedSeats.map(s => s.id)
      })
      toast.success('🎉 Booking confirmed!')
      navigate(`/booking-success/${data.bookingReference}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking'
      toast.error(msg)
      // Refresh layout to show updated seat availability
      showApi.getSeats(showId).then(res => { setLayout(res.data); setSelectedSeats([]) })
    } finally {
      setBooking(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" text="Loading seat layout..." /></div>
  )
  if (!layout) return null

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Show info header */}
        <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-bold text-xl">{layout.movieTitle}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {layout.theaterName} • {format(new Date(layout.showTime), 'MMM dd, h:mm a')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-gray-500 text-xs">Available</p>
              <p className="text-green-400 font-bold">{layout.availableSeats}</p>
            </div>
            {timeLeft !== null && (
              <div className={`text-center px-3 py-1.5 rounded-lg border ${timeLeft < 60 ? 'border-red-700 bg-red-950/50' : 'border-gray-700 bg-gray-900'}`}>
                <p className="text-gray-500 text-xs">Time Left</p>
                <p className={`font-bold font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Seat map + booking panel */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seat map */}
          <div className="lg:col-span-2 card p-6">
            <SeatMap
              layout={layout}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              maxSeats={8}
            />
          </div>

          {/* Booking summary */}
          <div className="card p-5 h-fit lg:sticky lg:top-20">
            <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

            {selectedSeats.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Select seats from the layout</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between text-sm">
                      <span className="text-gray-300 font-mono">{seat.seatNumber} <span className="text-gray-600 text-xs">({seat.seatType})</span></span>
                      <span className="text-white">₹{seat.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Convenience fee</span><span>₹0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-lg">
                    <span>Total</span><span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || booking}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {booking ? (
                <><Spinner size="sm" /> Booking...</>
              ) : (
                <>🎟️ Confirm Booking — ₹{totalAmount.toFixed(2)}</>
              )}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              Seats are confirmed instantly. No payment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
