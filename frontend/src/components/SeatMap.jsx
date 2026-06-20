import { useState, useMemo } from 'react'

const SEAT_PRICE_MULTIPLIERS = { STANDARD: 1, PREMIUM: 1.5, RECLINER: 2 }

export default function SeatMap({ layout, selectedSeats, onSeatToggle, maxSeats = 8 }) {
  const { seats = [] } = layout

  // Group seats by row
  const rows = useMemo(() => {
    const grouped = {}
    seats.forEach(seat => {
      if (!grouped[seat.row]) grouped[seat.row] = []
      grouped[seat.row].push(seat)
    })
    // Sort each row by seatIndex
    Object.keys(grouped).forEach(r => {
      grouped[r].sort((a, b) => a.seatIndex - b.seatIndex)
    })
    return grouped
  }, [seats])

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    const isBooked = seat.status === 'BOOKED'

    if (isBooked) return 'seat-booked'
    if (isSelected) {
      if (seat.seatType === 'PREMIUM') return 'seat-premium-selected'
      if (seat.seatType === 'RECLINER') return 'seat-recliner-selected'
      return 'seat-selected'
    }
    if (seat.seatType === 'PREMIUM') return 'seat-premium'
    if (seat.seatType === 'RECLINER') return 'seat-recliner'
    return 'seat-available'
  }

  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    if (!isSelected && selectedSeats.length >= maxSeats) return
    onSeatToggle(seat)
  }

  const rowLabels = Object.keys(rows).sort()

  return (
    <div className="w-full">
      {/* Screen indicator */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full mb-1 opacity-70" />
        <p className="text-gray-500 text-xs tracking-widest uppercase">Screen</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
        {[
          { cls: 'bg-gray-700 border border-gray-600', label: 'Standard' },
          { cls: 'bg-yellow-900 border border-yellow-700', label: 'Premium' },
          { cls: 'bg-purple-900 border border-purple-700', label: 'Recliner' },
          { cls: 'bg-red-600 border-2 border-red-400', label: 'Selected' },
          { cls: 'bg-gray-900 border border-gray-800', label: 'Booked' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${item.cls}`} />
            <span className="text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {rowLabels.map(rowLabel => (
            <div key={rowLabel} className="flex items-center gap-1 mb-1.5 justify-center">
              <span className="text-gray-600 text-xs w-5 text-right mr-1 font-mono">{rowLabel}</span>
              {rows[rowLabel].map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status === 'BOOKED'}
                  className={`w-7 h-7 flex items-center justify-center text-[9px] font-bold rounded transition-all ${getSeatClass(seat)}`}
                  title={`${seat.seatNumber} — ${seat.seatType} — ₹${seat.price}`}
                >
                  {seat.seatIndex}
                </button>
              ))}
              <span className="text-gray-600 text-xs w-5 text-left ml-1 font-mono">{rowLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected seats summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-[#1e1e2e] rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Selected Seats</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSeats.map(seat => (
              <span key={seat.id} className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-lg font-mono">
                {seat.seatNumber}
                <span className="text-red-500 ml-1">₹{seat.price}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-700 pt-3">
            <span className="text-gray-400 text-sm">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</span>
            <span className="text-white font-bold text-lg">
              Total: ₹{selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
