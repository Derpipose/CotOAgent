import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface AuthRequiredRouteProps {
  children: React.ReactNode
}

export default function AuthRequiredRoute({ children }: AuthRequiredRouteProps) {
  const navigate = useNavigate()
  const { isInitialized, isAuthenticated } = useAuth()

  if (!isInitialized) {
    return (
      <div className="auth-required-container">
        <div className="auth-required-loading">Verifying access...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-required-container">
        <div className="auth-required-error-box">
          <h2 className="auth-required-error-title">Access Denied</h2>
          <p className="auth-required-error-message">Please log in to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="auth-required-error-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
