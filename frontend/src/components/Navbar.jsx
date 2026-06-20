import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎬</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Cine<span className="text-red-500">Book</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
              Movies
            </Link>
            {user && (
              <Link to="/my-bookings" className={`text-sm font-medium transition-colors ${location.pathname === '/my-bookings' ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                My Bookings
              </Link>
            )}
            {user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
                    <span className="text-red-300 text-sm font-bold">{user.username[0].toUpperCase()}</span>
                  </div>
                  <span className="text-gray-300 text-sm">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 border border-gray-700 rounded-lg hover:border-red-700">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
