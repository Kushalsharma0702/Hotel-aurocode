/**
 * Hotel-CRM API client — connected to shared FastAPI backend.
 *
 * All mutations here (add room, update booking, etc.) write to PostgreSQL.
 * Client-CRM reads from the same database → instant sync.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('hotel_crm_token')
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('hotel_crm_token', access)
  localStorage.setItem('hotel_crm_refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('hotel_crm_token')
  localStorage.removeItem('hotel_crm_refresh_token')
  localStorage.removeItem('hotel_crm_user')
}

async function request(path: string, opts: RequestInit = {}): Promise<any> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, { ...opts, headers })
  if (res.status === 401) clearTokens()
  if (!res.ok) {
    const text = await res.text()
    let detail = text
    try { const j = JSON.parse(text); detail = j.error || j.detail || text } catch {}
    throw new Error(detail || res.statusText)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : res.text()
}

// ── Auth ──────────────────────────────────────────────────

export const hotelAuth = {
  login: async (email: string, password: string) => {
    const r = await request('/api/v1/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    })
    if (r.access_token) {
      setTokens(r.access_token, r.refresh_token)
      if (r.user) localStorage.setItem('hotel_crm_user', JSON.stringify(r.user))
    }
    return r
  },
  signup: async (data: { email: string; password: string; name?: string }) => {
    return request('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(data) })
  },
  verifyOtp: async (email: string, otp: string) => {
    const r = await request('/api/v1/auth/verify-otp', {
      method: 'POST', body: JSON.stringify({ email, otp })
    })
    if (r.access_token) {
      setTokens(r.access_token, r.refresh_token)
      if (r.user) localStorage.setItem('hotel_crm_user', JSON.stringify(r.user))
    }
    return r
  },
  logout: clearTokens,
  isLoggedIn: () => !!getToken(),
  getUser: () => {
    const raw = localStorage.getItem('hotel_crm_user')
    return raw ? JSON.parse(raw) : null
  },
}

// ── Rooms ─────────────────────────────────────────────────

export const roomsApi = {
  list: () => request('/api/v1/hotel/rooms'),
  get: (id: number) => request(`/api/v1/hotel/rooms/${id}`),
  create: (data: any) => request('/api/v1/hotel/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/v1/hotel/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/v1/hotel/rooms/${id}`, { method: 'DELETE' }),
  toggleAvailability: (id: number) => request(`/api/v1/hotel/rooms/${id}/toggle-availability`, { method: 'PUT' }),
}

// ── Bookings ──────────────────────────────────────────────

export const bookingsApi = {
  list: (skip = 0, limit = 50) => request(`/api/v1/hotel/bookings?skip=${skip}&limit=${limit}`),
  create: (data: any) => request('/api/v1/hotel/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/v1/hotel/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/v1/hotel/bookings/${id}`, { method: 'DELETE' }),
}

// ── Customers ─────────────────────────────────────────────

export const customersApi = {
  list: () => request('/api/v1/hotel/customers'),
  create: (data: any) => request('/api/v1/hotel/customers', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Stats ─────────────────────────────────────────────────

export const statsApi = {
  dashboard: () => request('/api/v1/hotel/stats'),
}

// ── Hotels (property management) ─────────────────────────
// These map to POST/GET /api/v1/hotels and POST /api/v1/hotels/{id}/rooms
// Client-CRM reads from these same endpoints.

export const hotelsApi = {
  list: () => request('/api/v1/hotels?limit=100'),
  get: (id: number) => request(`/api/v1/hotels/${id}`),
  create: (data: any) => request('/api/v1/hotels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request(`/api/v1/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/api/v1/hotels/${id}`, { method: 'DELETE' }),
  addRoom: (hotelId: number, data: any) =>
    request(`/api/v1/hotels/${hotelId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),
  listRooms: (hotelId: number) => request(`/api/v1/hotels/${hotelId}/rooms`),
}

// ── Packages (package bookings management) ───────────────

export const packagesApi = {
  list: (status?: string) => {
    const qs = status ? `?status=${status}` : ''
    return request(`/api/v1/packages/bookings${qs}`)
  },
  get: (id: string) => request(`/api/v1/packages/bookings/${id}`),
  create: (data: any) => request('/api/v1/packages/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/v1/packages/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/v1/packages/bookings/${id}`, { method: 'DELETE' }),
  stats: () => request('/api/v1/packages/stats'),
}

// ── Package Inventory ────────────────────────────────────

export const packageInventoryApi = {
  list: () => request('/api/v1/package-inventory'),
  get: (id: string) => request(`/api/v1/package-inventory/${id}`),
  create: (data: any) => request('/api/v1/package-inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/v1/package-inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/v1/package-inventory/${id}`, { method: 'DELETE' }),
}
