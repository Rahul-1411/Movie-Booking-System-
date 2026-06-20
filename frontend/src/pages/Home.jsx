import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Spinner from '../components/Spinner'
import { movieApi } from '../services/api'
import toast from 'react-hot-toast'

const FILTERS = ['All', 'NOW_SHOWING', 'COMING_SOON']
const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Fantasy', 'Thriller']

export default function Home() {
  const [movies, setMovies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [genreFilter, setGenreFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    movieApi.getAll()
      .then(res => { setMovies(res.data); setFiltered(res.data) })
      .catch(() => toast.error('Failed to load movies'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...movies]
    if (statusFilter !== 'All') result = result.filter(m => m.status === statusFilter)
    if (genreFilter !== 'All') result = result.filter(m => m.genre === genreFilter)
    if (search.trim()) result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [statusFilter, genreFilter, search, movies])

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-red-950/30 to-[#0a0a0f] py-16 px-4 text-center border-b border-[#1e1e2e]">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Book Your <span className="text-red-500">Experience</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">Discover movies, pick your seats, pay instantly</p>
        {/* Search */}
        <div className="max-w-lg mx-auto relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-3 text-base"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  statusFilter === f
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                {f === 'NOW_SHOWING' ? 'Now Showing' : f === 'COMING_SOON' ? 'Coming Soon' : 'All'}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-700 self-center hidden sm:block" />
          <div className="flex gap-2 flex-wrap">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  genreFilter === g
                    ? 'bg-gray-600 border-gray-600 text-white'
                    : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-6">
            {filtered.length} movie{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" text="Loading movies..." /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-white text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </div>
    </div>
  )
}
