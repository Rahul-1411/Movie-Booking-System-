import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, ask the backend who we are — the HttpOnly cookie is sent automatically
  useEffect(() => {
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = (data) => {
    // JWT now lives in an HttpOnly cookie set by the server — just store user info
    setUser({ id: data.id, username: data.username, email: data.email, role: data.role })
  }

  const logout = async () => {
    try {
      await authApi.logout() // clears the cookie server-side
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'ROLE_ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

