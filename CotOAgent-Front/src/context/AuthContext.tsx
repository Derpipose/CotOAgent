import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import keycloak from '../keycloak'
import { AuthContext } from './AuthContextDef'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Keycloak is already initialized in App.tsx, but we'll check the token here
        if (!keycloak.token) {
          console.log('[AuthContext] No Keycloak token available')
          setIsInitialized(true)
          setIsAuthenticated(false)
          return
        }

        const authenticated = keycloak.authenticated || false
        setIsAuthenticated(authenticated)
        console.log('[AuthContext] Authenticated:', authenticated)
        
        const email = keycloak.tokenParsed?.email
        setUserEmail(email || null)
        console.log('[AuthContext] User email:', email)

        // Check admin status if authenticated
        if (authenticated && email) {
          try {
            const backendUrl = window.location.protocol === 'https:' 
              ? `https://${window.location.hostname}/api`
              : 'http://localhost:3000/api'

            // Normalize email
            const normalizedEmail = email.trim().toLowerCase()
            console.log('[AuthContext] Checking admin status at:', `${backendUrl}/auth/check-admin`, 'with email:', normalizedEmail)
            const response = await fetch(`${backendUrl}/auth/check-admin`, {
              headers: {
                'x-user-email': normalizedEmail
              }
            })

            const data = await response.json()
            console.log('[AuthContext] Admin check response:', data)
            setIsAdmin(data.isAdmin || false)
          } catch (err) {
            console.error('[AuthContext] Failed to check admin status:', err)
            setIsAdmin(false)
          }
        } else {
          console.log('[AuthContext] Not authenticated or no email, setting isAdmin to false')
          setIsAdmin(false)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    // Small delay to ensure Keycloak initialization from App.tsx is complete
    const timer = setTimeout(initializeAuth, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthContext.Provider value={{ isInitialized, isAuthenticated, isAdmin, userEmail }}>
      {children}
    </AuthContext.Provider>
  )
}
