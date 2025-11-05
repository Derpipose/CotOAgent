import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import keycloak from './keycloak'

function App() {
  const [count, setCount] = useState(0)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [keycloakInitialized, setKeycloakInitialized] = useState(false)

  useEffect(() => {
    if (keycloakInitialized) {
      return
    }

    keycloak
      .init({ 
        onLoad: 'login-required',
        checkLoginIframe: false,
        messageReceiveTimeout: 10000,
        enableLogging: true
      })
      .then((auth) => {
        setAuthenticated(auth)
        setLoading(false)
        setKeycloakInitialized(true)
      })
      .catch((error) => {
        console.error('Keycloak initialization failed:', error)
        setLoading(false)
      })
  }, [keycloakInitialized])

  const handleLogin = () => {
    if (!keycloakInitialized) return
    keycloak.login()
  }

  const handleLogout = () => {
    if (!keycloakInitialized) return
    keycloak.logout()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div>
        {authenticated ? (
          <div>
            <p>Welcome, {keycloak.tokenParsed?.preferred_username || 'User'}!</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </div>
    </>
  )
}

export default App
