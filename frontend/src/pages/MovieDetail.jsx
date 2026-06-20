import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieApi, showApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function MovieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([movieApi.getById(id), showApi.getByMovie(id)])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data)
        setShows(showsRes.data)
      })
      .catch(() => toast.error('Failed to load movie details'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSelectShow = (show) => {
    if (!user) {
      toast.error('Please sign in to book tickets')
      navigate('/login')
      return
    }
    navigate(`/shows/${show.id}/seats`)
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" text="Loading..." /></div>
  )
  if (!movie) return <div className="min-h-screen pt-24 text-center text-gray-400">Movie not found</div>

  // Group shows by date
  const showsByDate = shows.reduce((acc, show) => {
    const date = format(new Date(show.showTime), 'MMM dd, yyyy')
    if (!acc[date]) acc[date] = []
    acc[date].push(show)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-16">
      {/* Hero section */}
      <div className="relative">
        {movie.posterUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={movie.posterUrl} alt="" className="w-full h-full object-cover blur-2xl opacity-20 scale-110" />
          </div>
        )}
        <div className="relative bg-gradient-to-b from-black/40 to-[#0a0a0f]">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-52 h-72 rounded-xl overflow-hidden shadow-2xl shadow-black border border-[#1e1e2e]">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-950 to-gray-900 flex items-center justify-center">
                      <span className="text-5xl">🎬</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${movie.status === 'NOW_SHOWING' ? 'bg-green-600' : 'bg-yellow-600 text-black'}`}>
                    {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-900 text-blue-300">{movie.genre}</span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-300">{movie.language}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h1>
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= Math.round(movie.rating / 2) ? 'text-yellow-400' : 'text-gray-700'}>★</span>
                    ))}
                    <span className="text-gray-400 text-sm ml-1">{movie.rating}/10</span>
                  </div>
                )}
                <p className="text-gray-300 text-base leading-relaxed mb-4">{movie.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {movie.director && (
                    <div><span className="text-gray-500">Director</span><p className="text-white">{movie.director}</p></div>
                  )}
                  {movie.duration && (
                    <div><span className="text-gray-500">Duration</span><p className="text-white">{Math.floor(movie.duration/60)}h {movie.duration%60}m</p></div>
                  )}
                  {movie.cast && (
                    <div className="col-span-2"><span className="text-gray-500">Cast</span><p className="text-white">{movie.cast}</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shows */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-white mb-6">Available Shows</h2>
        {shows.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400">No shows available for this movie yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(showsByDate).map(([date, dateShows]) => (
              <div key={date}>
                <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">{date}</h3>
                <div className="flex flex-wrap gap-3">
                  {dateShows.map(show => (
                    <button
                      key={show.id}
                      onClick={() => handleSelectShow(show)}
                      disabled={show.availableSeats === 0 || movie.status === 'COMING_SOON'}
                      className={`card p-4 text-left min-w-[160px] transition-all border-2 ${
                        show.availableSeats === 0
                          ? 'border-gray-800 opacity-50 cursor-not-allowed'
                          : 'border-[#1e1e2e] hover:border-red-700 cursor-pointer'
                      }`}
                    >
                      <p className="text-white font-bold text-base">{format(new Date(show.showTime), 'h:mm a')}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{show.theaterName}</p>
                      <p className="text-gray-500 text-xs">{show.theaterCity}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-red-400 font-semibold text-sm">₹{show.price}</span>
                        <span className={`text-xs ${show.availableSeats < 20 ? 'text-red-400' : 'text-green-400'}`}>
                          {show.availableSeats === 0 ? 'Sold Out' : `${show.availableSeats} left`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
