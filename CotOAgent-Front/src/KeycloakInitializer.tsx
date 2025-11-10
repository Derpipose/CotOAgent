import { useState, useEffect, useRef } from 'react'
import keycloak from './keycloak'

function KeycloakInitializer({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const initStarted = useRef(false)

  useEffect(() => {
    console.log('[KeycloakInitializer] Effect running, initStarted.current:', initStarted.current)
    
    // If already initialized, don't try again
    if (initStarted.current) {
      console.log('[KeycloakInitializer] Initialization already started, skipping')
      return
    }

    initStarted.current = true
    console.log('[KeycloakInitializer] Starting Keycloak initialization...')

    // Set a timeout to force loading to false if initialization takes too long
    const initTimeout = setTimeout(() => {
      console.warn('[KeycloakInitializer] Keycloak initialization timeout - forcing load to complete')
      setLoading(false)
    }, 15000) // 15 second timeout

    keycloak
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        messageReceiveTimeout: 10000,
        enableLogging: true,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
      })
      .then((auth) => {
        console.log('[KeycloakInitializer] Keycloak initialization successful, authenticated:', auth)
        clearTimeout(initTimeout)

        // Set up token refresh handler
        keycloak.onTokenExpired = () => {
          console.log('[KeycloakInitializer] Token expired, refreshing...')
          keycloak.updateToken(5)
            .then(() => {
              console.log('[KeycloakInitializer] Token refreshed successfully')
            })
            .catch(() => {
              console.log('[KeycloakInitializer] Token refresh failed')
            })
        }

        console.log('[KeycloakInitializer] Setting loading to false after success')
        setLoading(false)
      })
      .catch((error) => {
        console.error('[KeycloakInitializer] Keycloak initialization failed:', error)
        console.log('[KeycloakInitializer] Setting loading to false after error')
        clearTimeout(initTimeout)
        setLoading(false)
      })

    return () => {
      clearTimeout(initTimeout)
    }
  }, [])

  console.log('[KeycloakInitializer] Render, loading:', loading)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return <>{children}</>
}

export default KeycloakInitializer
