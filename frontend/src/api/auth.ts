import type { User } from '../types/auth'

const SESSION_KEY = 'cyberwatch_current_session'
const JWT_KEY = 'cyberwatch_jwt_token'

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server. Please verify the backend is active on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        throw new Error(data?.detail || 'Invalid email or password')
      }
      throw new Error(data?.detail || `Authentication failed with status ${res.status}`)
    }

    const json = await res.json()
    const { access_token, user } = json.data

    const userObj: User = {
      name: user.full_name,
      email: user.email,
      role: user.role
    }

    localStorage.setItem(JWT_KEY, access_token)
    localStorage.setItem(SESSION_KEY, JSON.stringify(userObj))
    return userObj
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ full_name: name, email, password })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server. Please verify the backend is active on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.detail || 'Failed to create account')
    }

    // Auto login after sign up
    return authApi.login(email, password)
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(JWT_KEY)
    if (!token) return null

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        // If explicitly unauthorized or forbidden, clear the session
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem(JWT_KEY)
          localStorage.removeItem(SESSION_KEY)
          return null
        }
        // If server returned temporary error (500, 502, 503), do not wipe token; fallback to cached session
        const raw = localStorage.getItem(SESSION_KEY)
        return raw ? JSON.parse(raw) : null
      }

      const json = await res.json()
      const user = json.data

      const userObj: User = {
        name: user.full_name,
        email: user.email,
        role: user.role
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj))
      return userObj
    } catch {
      // Temporary network failure (backend offline/restarting)
      // DO NOT erase JWT or session keys on temporary network failure
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    }
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem(JWT_KEY)
    if (token) {
      await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {})
    }
    localStorage.removeItem(JWT_KEY)
    localStorage.removeItem(SESSION_KEY)
  }
}
