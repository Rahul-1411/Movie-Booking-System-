import { Link } from 'react-router-dom'

const GENRE_COLORS = {
  'Sci-Fi': 'bg-blue-900 text-blue-300',
  'Action': 'bg-red-900 text-red-300',
  'Fantasy': 'bg-purple-900 text-purple-300',
  'Drama': 'bg-yellow-900 text-yellow-300',
  'Horror': 'bg-gray-900 text-gray-300',
  'Comedy': 'bg-green-900 text-green-300',
}

const STATUS_BADGE = {
  NOW_SHOWING: { label: 'Now Showing', cls: 'bg-green-600 text-white' },
  COMING_SOON: { label: 'Coming Soon', cls: 'bg-yellow-600 text-black' },
  ENDED: { label: 'Ended', cls: 'bg-gray-700 text-gray-300' },
}

export default function MovieCard({ movie }) {
  const status = STATUS_BADGE[movie.status] || STATUS_BADGE.NOW_SHOWING
  const genreColor = GENRE_COLORS[movie.genre] || 'bg-gray-800 text-gray-300'

  return (
    <Link to={`/movies/${movie.id}`} className="movie-card card block group hover:border-red-800 transition-colors duration-200">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://via.placeholder.com/300x450/12121a/e63946?text=${encodeURIComponent(movie.title)}` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950 to-gray-900">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        {/* Overlay */}
        <div className="movie-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center">
          <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Book Now</span>
        </div>
        {/* Status badge */}
        <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
          {status.label}
        </div>
        {/* Rating */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            ⭐ {movie.rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1 mb-1.5">{movie.title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreColor}`}>{movie.genre}</span>
          {movie.duration && (
            <span className="text-gray-500 text-xs">{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          )}
        </div>
        {movie.language && (
          <p className="text-gray-600 text-xs mt-1">{movie.language}</p>
        )}
      </div>
    </Link>
  )
}
