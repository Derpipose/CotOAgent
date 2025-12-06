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
    let checkInterval: ReturnType<typeof setInterval>
    let fallbackTimer: ReturnType<typeof setTimeout>
    let isMounted = true

    const startChecking = () => {
      checkInterval = setInterval(() => {
        console.log('[AuthContext] Checking if Keycloak is ready... keycloak.token:', keycloak.token ? 'exists' : 'undefined')
        if (keycloak.token !== undefined || keycloak.authenticated) {
          clearInterval(checkInterval)
          clearTimeout(fallbackTimer)
          console.log('[AuthContext] Keycloak ready, updating auth state')
          if (isMounted) {
            updateAuthState()
          }
        }
      }, 100)

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
    const tokenRefreshInterval = setInterval(() => {
      try {
        if (keycloak.authenticated && keycloak.isTokenExpired && keycloak.isTokenExpired(5)) {
          keycloak.updateToken(5)
            .then(() => {
              updateAuthState()
            })
            .catch(() => {
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
