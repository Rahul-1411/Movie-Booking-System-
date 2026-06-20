import { useState, useEffect } from 'react'
import { bookingApi } from '../services/api'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed', cls: 'bg-green-900 text-green-400' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-gray-800 text-gray-400' },
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    bookingApi.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return
    setCancelling(id)
    try {
      await bookingApi.cancel(id)
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: 'CANCELLED' } : b))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" text="Loading bookings..." /></div>
  )

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-white text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm mb-6">Book your first movie ticket to get started</p>
            <a href="/" className="btn-primary inline-block">Browse Movies</a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const statusConf = STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED
              return (
                <div key={booking.bookingId} className="card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-white font-bold text-base">{booking.movieTitle}</h2>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConf.cls}`}>
                          {statusConf.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{booking.theaterName}</p>
                      {booking.showTime && (
                        <p className="text-gray-500 text-sm">{format(new Date(booking.showTime), 'MMM dd, yyyy • h:mm a')}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {booking.seats?.map(seat => (
                          <span key={seat} className="bg-[#1e1e2e] text-gray-300 text-xs font-mono px-2 py-0.5 rounded border border-gray-800">{seat}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-lg">₹{booking.totalAmount}</p>
                      <p className="text-gray-600 text-xs font-mono mt-0.5">{booking.bookingReference}</p>
                      {booking.createdAt && (
                        <p className="text-gray-600 text-xs mt-0.5">
                          {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                        </p>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(booking.bookingId)}
                          disabled={cancelling === booking.bookingId}
                          className="mt-2 text-xs text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 px-3 py-1 rounded-lg transition-colors"
                        >
                          {cancelling === booking.bookingId ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
