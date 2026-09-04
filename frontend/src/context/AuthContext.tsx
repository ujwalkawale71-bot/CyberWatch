import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types/auth'
import { authApi } from '../api/auth'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initializeAuth() {
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to initialize authentication:', err)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const loggedUser = await authApi.login(email, password)
      setUser(loggedUser)
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const registeredUser = await authApi.signup(name, email, password)
      setUser(registeredUser)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
