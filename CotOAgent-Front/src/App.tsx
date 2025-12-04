import { useState, useEffect } from 'react'
import keycloak from './keycloak'

function App() {
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated || false)

  useEffect(() => {
    console.log('[App] Keycloak authenticated:', keycloak.authenticated)
    setAuthenticated(keycloak.authenticated || false)
  }, [])

  const handleLogin = () => {
    console.log('[App] Login button clicked')
    keycloak.login()
  }

  const handleLogout = () => {
    console.log('[App] Logout button clicked')
    keycloak.logout()
  }

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-title">Chronicles of the Omuns</h1>
        <p className="app-subtitle">Character Creation Assistant</p>
        <p className="app-description">
          Welcome to the Chronicles of the Omuns character creation tool. 
          Use our AI-powered assistant to build and develop your unique character 
          for your adventures in this immersive world.
        </p>
        
        <div className="app-button-container">
          {authenticated ? (
            <div className="app-authenticated-section">
              <p className="app-welcome-text">
                Welcome, <span className="app-welcome-username">{keycloak.tokenParsed?.preferred_username || 'Adventurer'}</span>!
              </p>
              <a href="/about" className="no-underline">
                <button className="btn-primary-gradient">How to get started</button>
              </a>
              <button className="app-logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="app-unauthenticated-section">
              <p className="app-signin-prompt">Sign in to begin your journey</p>
              <button className="app-login-button" onClick={handleLogin}>
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
