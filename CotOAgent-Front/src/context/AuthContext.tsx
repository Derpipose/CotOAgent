import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import keycloak from '../keycloak'
import { AuthContext } from './AuthContextDef'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const checkAdminStatus = useCallback(async (email: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      console.log('[AuthContext] Checking admin status with email:', normalizedEmail)
      const response = await fetch(`/api/auth/check-admin`, {
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
  }, [])

  const updateAuthState = useCallback(async () => {
    try {
      // console.log('[AuthContext] updateAuthState called')
      // console.log('[AuthContext] keycloak.authenticated:', keycloak.authenticated)
      // console.log('[AuthContext] keycloak.token:', keycloak.token)
      // console.log('[AuthContext] keycloak.tokenParsed:', keycloak.tokenParsed)
      // console.log('[AuthContext] keycloak.refreshToken:', keycloak.refreshToken)
      
      // Check if Keycloak is initialized
      if (!keycloak.authenticated) {
        console.log('[AuthContext] Not authenticated - keycloak.authenticated is false or undefined')
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserEmail(null)
        setIsInitialized(true)
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
        await checkAdminStatus(email)
      } else {
        console.log('[AuthContext] Not authenticated or no email, setting isAdmin to false')
        setIsAdmin(false)
      }
    } catch (err) {
      console.error('[AuthContext] Error updating auth state:', err)
      setIsAdmin(false)
    } finally {
      setIsInitialized(true)
    }
  }, [checkAdminStatus])

  useEffect(() => {
    // Set up a listener for when Keycloak is ready
    let checkInterval: ReturnType<typeof setInterval>
    let fallbackTimer: ReturnType<typeof setTimeout>
    let isMounted = true

    const startChecking = () => {
      checkInterval = setInterval(() => {
        console.log('[AuthContext] Checking if Keycloak is ready... keycloak.token:', keycloak.token ? 'exists' : 'undefined')
        // Check if Keycloak has a token (meaning it's been initialized)
        if (keycloak.token !== undefined || keycloak.authenticated) {
          clearInterval(checkInterval)
          clearTimeout(fallbackTimer)
          console.log('[AuthContext] Keycloak ready, updating auth state')
          if (isMounted) {
            updateAuthState()
          }
        }
      }, 100)

      // Fallback: if Keycloak doesn't report ready within 5 seconds, update anyway
      fallbackTimer = setTimeout(() => {
        clearInterval(checkInterval)
        console.log('[AuthContext] Keycloak fallback timer triggered after 5 seconds')
        if (isMounted) {
          updateAuthState()
        }
      }, 5000)
    }

    startChecking()

    return () => {
      isMounted = false
      clearInterval(checkInterval)
      clearTimeout(fallbackTimer)
    }
  }, [updateAuthState])

  useEffect(() => {
    // Set up periodic check to refresh auth state when token is about to expire
    // This ensures the auth state stays in sync with Keycloak token status
    const tokenRefreshInterval = setInterval(() => {
      try {
        if (keycloak.authenticated && keycloak.isTokenExpired && keycloak.isTokenExpired(5)) {
          // Token is expiring soon, try to refresh it
          keycloak.updateToken(5)
            .then(() => {
              console.log('[AuthContext] Token refreshed, updating auth state')
              updateAuthState()
            })
            .catch((err) => {
              console.log('[AuthContext] Token refresh failed:', err)
              setIsAuthenticated(false)
              setIsAdmin(false)
              setUserEmail(null)
              setIsInitialized(true)
            })
        }
      } catch (err) {
        console.error('[AuthContext] Error in token refresh interval:', err)
      }
    }, 10000) // Check every 10 seconds

    return () => {
      clearInterval(tokenRefreshInterval)
    }
  }, [updateAuthState])

  return (
    <AuthContext.Provider value={{ isInitialized, isAuthenticated, isAdmin, userEmail }}>
      {children}
    </AuthContext.Provider>
  )
}
