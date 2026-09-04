export interface User {
  name: string
  email: string
  role: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}
