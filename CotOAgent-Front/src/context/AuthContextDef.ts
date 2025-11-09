import { createContext } from 'react'

export interface AuthContextType {
  isInitialized: boolean
  isAuthenticated: boolean
  isAdmin: boolean | null
  userEmail: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
