import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import BookingSuccess from './pages/BookingSuccess'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import Spinner from './components/Spinner'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  return user?.role === 'ROLE_ADMIN' ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/shows/:showId/seats" element={
          <PrivateRoute><SeatSelection /></PrivateRoute>
        } />
        <Route path="/booking-success/:ref" element={
          <PrivateRoute><BookingSuccess /></PrivateRoute>
        } />
        <Route path="/my-bookings" element={
          <PrivateRoute><MyBookings /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#12121a', color: '#e2e8f0', border: '1px solid #1e1e2e' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  )
}
