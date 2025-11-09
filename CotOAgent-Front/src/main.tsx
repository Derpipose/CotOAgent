import { StrictMode, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Races from './pages/Races'
import Classes from './pages/Classes'
import Spells from './pages/Spells'
import CharacterSheet from './pages/CharacterSheet'
import Admin from './pages/Admin'
import App from './App'
import SideNavBar from './NavBar/SideNavBar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import keycloak from './keycloak'
import './css/protected-route.css'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeycloakInitializer>
      <BrowserRouter>
        <AuthProvider>
          <SideNavBar />
          <div style={{ marginLeft: '250px' }}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/races" element={<Races />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/spells" element={<Spells />} />
              <Route path="/character-sheet" element={<CharacterSheet />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </KeycloakInitializer>
  </StrictMode>,
)
