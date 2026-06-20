import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { bookingApi } from '../services/api'
import Spinner from '../components/Spinner'
import { format } from 'date-fns'

export default function BookingSuccess() {
  const { ref } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingApi.getByReference(ref)
      .then(res => setBooking(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ref])

  if (loading) return (
    <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>
  )

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-600">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h1>
          <p className="text-gray-400">Your tickets are ready</p>
        </div>

        {/* Ticket card */}
        {booking && (
          <div className="card overflow-hidden">
            {/* Ticket header */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 p-5">
              <h2 className="text-white font-bold text-xl">{booking.movieTitle}</h2>
              <p className="text-red-200 text-sm mt-0.5">{booking.theaterName}</p>
            </div>

            {/* Perforation */}
            <div className="flex items-center -my-px">
              <div className="w-4 h-4 bg-[#0a0a0f] rounded-full -ml-2 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-[#1e1e2e]" />
              <div className="w-4 h-4 bg-[#0a0a0f] rounded-full -mr-2 flex-shrink-0" />
            </div>

            {/* Ticket body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Date & Time</p>
                  <p className="text-white font-medium text-sm mt-0.5">
                    {booking.showTime ? format(new Date(booking.showTime), 'MMM dd, yyyy') : '—'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {booking.showTime ? format(new Date(booking.showTime), 'h:mm a') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Seats</p>
                  <p className="text-white font-medium text-sm mt-0.5">
                    {booking.seats?.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Amount Paid</p>
                  <p className="text-green-400 font-bold text-lg mt-0.5">₹{booking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Status</p>
                  <span className="inline-block mt-0.5 bg-green-900 text-green-400 text-xs font-bold px-2 py-0.5 rounded">
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Booking reference barcode-style */}
              <div className="bg-[#0a0a0f] rounded-lg p-3 text-center border border-[#1e1e2e]">
                <p className="text-gray-500 text-xs mb-1">Booking Reference</p>
                <p className="text-white font-mono font-bold text-lg tracking-widest">{booking.bookingReference}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Link to="/my-bookings" className="btn-secondary flex-1 text-center">My Bookings</Link>
          <Link to="/" className="btn-primary flex-1 text-center">Book More</Link>
        </div>
      </div>
    </div>
  )
}
