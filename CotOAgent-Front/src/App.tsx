import { useState, useEffect, useRef } from 'react'
import './App.css'
import keycloak from './keycloak'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const initAttempted = useRef(false)

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initAttempted.current) {
      console.log('[App] Keycloak initialization already attempted, skipping')
      return
    }

    initAttempted.current = true

    console.log('[App] Initializing Keycloak...')
    keycloak
      .init({ 
        onLoad: 'check-sso',
        checkLoginIframe: false,
        messageReceiveTimeout: 10000,
        enableLogging: true
      })
      .then((auth) => {
        console.log('[App] Keycloak initialization successful, authenticated:', auth)
        setAuthenticated(auth)
        setLoading(false)
      })
      .catch((error) => {
        console.error('[App] Keycloak initialization failed:', error)
        setLoading(false)
      })
  }, [])

  const handleLogin = () => {
    console.log('[App] Login button clicked')
    keycloak.login()
  }

  const handleLogout = () => {
    console.log('[App] Logout button clicked')
    keycloak.logout()
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Chronicles of the Omuns</h1>
        <p className="welcome-subtitle">Character Creation Assistant</p>
        <p className="welcome-description">
          Welcome to the Chronicles of the Omuns character creation tool. 
          Use our AI-powered assistant to build and develop your unique character 
          for your adventures in this immersive world.
        </p>
        
        <div className="auth-section">
          {authenticated ? (
            <div className="authenticated">
              <p className="welcome-message">
                Welcome, <span className="username">{keycloak.tokenParsed?.preferred_username || 'Adventurer'}</span>!
              </p>
              <a href="/about" className="nav-link">
                <button className="btn btn-primary">How to get started</button>
              </a>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="unauthenticated">
              <p className="login-prompt">Sign in to begin your journey</p>
              <button className="btn btn-primary btn-large" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
