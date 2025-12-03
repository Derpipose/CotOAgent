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
    <div className="flex-center bg-gradient-primary w-full min-h-screen p-8 m-0 box-border overflow-auto">
      <div className="card-elevated max-w-2xl text-center animate-slideUp">
        <h1 className="text-6xl font-bold text-indigo-600 m-0 mb-2 tracking-tighter">Chronicles of the Omuns</h1>
        <p className="text-2xl text-violet-700 font-medium m-0 mb-8">Character Creation Assistant</p>
        <p className="text-base text-gray-600 leading-relaxed m-0 mb-10">
          Welcome to the Chronicles of the Omuns character creation tool. 
          Use our AI-powered assistant to build and develop your unique character 
          for your adventures in this immersive world.
        </p>
        
        <div className="mt-8">
          {authenticated ? (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-lg text-gray-800 m-0">
                Welcome, <span className="font-bold text-indigo-600">{keycloak.tokenParsed?.preferred_username || 'Adventurer'}</span>!
              </p>
              <a href="/about" className="no-underline">
                <button className="btn-primary-gradient">How to get started</button>
              </a>
              <button className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg cursor-pointer transition-all hover:bg-gray-300 hover:translate-y-[-2px] active:translate-y-0" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center">
              <p className="text-base text-gray-600 m-0">Sign in to begin your journey</p>
              <button className="btn-primary-gradient text-lg px-8 py-4" onClick={handleLogin}>
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
