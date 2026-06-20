import { useState, useEffect } from 'react'
import { movieApi, showApi, theaterApi } from '../services/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

const TABS = ['Movies', 'Shows', 'Theaters']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Movies')
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)

  // New movie form
  const [movieForm, setMovieForm] = useState({
    title: '', genre: '', language: 'English', duration: '', director: '', cast: '',
    description: '', posterUrl: '', rating: '', status: 'NOW_SHOWING'
  })

  // New show form
  const [showForm, setShowForm] = useState({ movieId: '', theaterId: '', showTime: '', price: '', totalSeats: 100 })

  // New theater form
  const [theaterForm, setTheaterForm] = useState({ name: '', city: '', location: '', address: '', totalSeats: 100 })

  useEffect(() => {
    Promise.all([movieApi.getAll(), showApi.getAll(), theaterApi.getAll()])
      .then(([m, s, t]) => { setMovies(m.data); setShows(s.data); setTheaters(t.data) })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddMovie = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...movieForm, duration: parseInt(movieForm.duration), rating: parseFloat(movieForm.rating) || 0 }
      const { data } = await movieApi.create(payload)
      setMovies(prev => [...prev, data])
      setMovieForm({ title: '', genre: '', language: 'English', duration: '', director: '', cast: '', description: '', posterUrl: '', rating: '', status: 'NOW_SHOWING' })
      toast.success('Movie added!')
    } catch { toast.error('Failed to add movie') }
  }

  const handleDeleteMovie = async (id) => {
    if (!confirm('Delete this movie?')) return
    try {
      await movieApi.delete(id)
      setMovies(prev => prev.filter(m => m.id !== id))
      toast.success('Movie deleted')
    } catch { toast.error('Failed to delete movie') }
  }

  const handleAddShow = async (e) => {
    e.preventDefault()
    try {
      await showApi.create({ ...showForm, movieId: parseInt(showForm.movieId), theaterId: parseInt(showForm.theaterId), price: parseFloat(showForm.price), totalSeats: parseInt(showForm.totalSeats) })
      const { data } = await showApi.getAll()
      setShows(data)
      setShowForm({ movieId: '', theaterId: '', showTime: '', price: '', totalSeats: 100 })
      toast.success('Show created!')
    } catch { toast.error('Failed to create show') }
  }

  const handleAddTheater = async (e) => {
    e.preventDefault()
    try {
      const { data } = await theaterApi.create({ ...theaterForm, totalSeats: parseInt(theaterForm.totalSeats) })
      setTheaters(prev => [...prev, data])
      setTheaterForm({ name: '', city: '', location: '', address: '', totalSeats: 100 })
      toast.success('Theater added!')
    } catch { toast.error('Failed to add theater') }
  }

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>

  const inputCls = 'input-field text-sm'

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ label: 'Movies', count: movies.length, icon: '🎬' },
            { label: 'Shows', count: shows.length, icon: '📅' },
            { label: 'Theaters', count: theaters.length, icon: '🏛️' }].map(stat => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div><p className="text-2xl font-bold text-white">{stat.count}</p><p className="text-gray-500 text-sm">{stat.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1e1e2e]">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Movies Tab */}
        {tab === 'Movies' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="text-white font-semibold mb-4">Add Movie</h2>
              <form onSubmit={handleAddMovie} className="space-y-3">
                <input className={inputCls} placeholder="Title *" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="Genre *" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
                  <input className={inputCls} placeholder="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} type="number" placeholder="Duration (mins)" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} />
                  <input className={inputCls} type="number" step="0.1" placeholder="Rating (0-10)" value={movieForm.rating} onChange={e => setMovieForm({...movieForm, rating: e.target.value})} />
                </div>
                <input className={inputCls} placeholder="Director" value={movieForm.director} onChange={e => setMovieForm({...movieForm, director: e.target.value})} />
                <input className={inputCls} placeholder="Cast (comma separated)" value={movieForm.cast} onChange={e => setMovieForm({...movieForm, cast: e.target.value})} />
                <input className={inputCls} placeholder="Poster URL" value={movieForm.posterUrl} onChange={e => setMovieForm({...movieForm, posterUrl: e.target.value})} />
                <textarea className={inputCls} placeholder="Description" rows={2} value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
                <select className={inputCls} value={movieForm.status} onChange={e => setMovieForm({...movieForm, status: e.target.value})}>
                  <option value="NOW_SHOWING">Now Showing</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="ENDED">Ended</option>
                </select>
                <button type="submit" className="btn-primary w-full">Add Movie</button>
              </form>
            </div>
            <div>
              <h2 className="text-white font-semibold mb-4">All Movies ({movies.length})</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {movies.map(m => (
                  <div key={m.id} className="card p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{m.title}</p>
                      <p className="text-gray-500 text-xs">{m.genre} • {m.status}</p>
                    </div>
                    <button onClick={() => handleDeleteMovie(m.id)} className="text-red-500 hover:text-red-400 text-xs border border-red-900 px-2 py-1 rounded flex-shrink-0">Del</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shows Tab */}
        {tab === 'Shows' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="text-white font-semibold mb-4">Create Show</h2>
              <form onSubmit={handleAddShow} className="space-y-3">
                <select className={inputCls} value={showForm.movieId} onChange={e => setShowForm({...showForm, movieId: e.target.value})} required>
                  <option value="">Select Movie *</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <select className={inputCls} value={showForm.theaterId} onChange={e => setShowForm({...showForm, theaterId: e.target.value})} required>
                  <option value="">Select Theater *</option>
                  {theaters.map(t => <option key={t.id} value={t.id}>{t.name} — {t.city}</option>)}
                </select>
                <input className={inputCls} type="datetime-local" value={showForm.showTime} onChange={e => setShowForm({...showForm, showTime: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} type="number" placeholder="Price (₹) *" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />
                  <input className={inputCls} type="number" placeholder="Total Seats" value={showForm.totalSeats} onChange={e => setShowForm({...showForm, totalSeats: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full">Create Show</button>
              </form>
            </div>
            <div>
              <h2 className="text-white font-semibold mb-4">All Shows ({shows.length})</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {shows.map(s => (
                  <div key={s.id} className="card p-3">
                    <p className="text-white text-sm font-medium">{s.movieTitle}</p>
                    <p className="text-gray-500 text-xs">{s.theaterName} • {s.theaterCity}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-xs">{new Date(s.showTime).toLocaleString()}</p>
                      <span className="text-green-400 text-xs font-mono">{s.availableSeats} seats</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Theaters Tab */}
        {tab === 'Theaters' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="text-white font-semibold mb-4">Add Theater</h2>
              <form onSubmit={handleAddTheater} className="space-y-3">
                <input className={inputCls} placeholder="Theater Name *" value={theaterForm.name} onChange={e => setTheaterForm({...theaterForm, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="City *" value={theaterForm.city} onChange={e => setTheaterForm({...theaterForm, city: e.target.value})} required />
                  <input className={inputCls} placeholder="Location" value={theaterForm.location} onChange={e => setTheaterForm({...theaterForm, location: e.target.value})} />
                </div>
                <input className={inputCls} placeholder="Full Address" value={theaterForm.address} onChange={e => setTheaterForm({...theaterForm, address: e.target.value})} />
                <input className={inputCls} type="number" placeholder="Total Seats" value={theaterForm.totalSeats} onChange={e => setTheaterForm({...theaterForm, totalSeats: e.target.value})} />
                <button type="submit" className="btn-primary w-full">Add Theater</button>
              </form>
            </div>
            <div>
              <h2 className="text-white font-semibold mb-4">All Theaters ({theaters.length})</h2>
              <div className="space-y-2">
                {theaters.map(t => (
                  <div key={t.id} className="card p-3">
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.city} • {t.location}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{t.address}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
