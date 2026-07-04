import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // No localStorage to clear — the cookie is cleared server-side via /auth/logout.
      // Avoid redirect loops if we're already on a public auth page.
      const publicPaths = ['/login', '/register']
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Movies
export const movieApi = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  search: (q) => api.get('/movies', { params: { search: q } }),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
}

// Shows
export const showApi = {
  getAll: () => api.get('/shows'),
  getByMovie: (movieId) => api.get(`/shows/movie/${movieId}`),
  getSeats: (showId) => api.get(`/shows/${showId}/seats`),
  create: (data) => api.post('/shows', data),
}

// Bookings
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getByReference: (ref) => api.get(`/bookings/reference/${ref}`),
  cancel: (id) => api.delete(`/bookings/${id}/cancel`),
}

// Theaters
export const theaterApi = {
  getAll: () => api.get('/theaters'),
  create: (data) => api.post('/theaters', data),
}
