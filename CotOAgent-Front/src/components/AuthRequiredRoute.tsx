import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import '../css/protected-route.css'

interface AuthRequiredRouteProps {
  children: React.ReactNode
}

/**
 * AuthRequiredRoute component that requires authentication
 * Redirects to home page if user is not authenticated
 * @param children - The component to render if authenticated
 */
export default function AuthRequiredRoute({ children }: AuthRequiredRouteProps) {
  const navigate = useNavigate()
  const { isInitialized, isAuthenticated } = useAuth()

  // Still loading auth
  if (!isInitialized) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading">Verifying access...</div>
      </div>
    )
  }

  // Not authenticated - redirect to home
  if (!isAuthenticated) {
    return (
      <div className="auth-error-container">
        <div className="auth-error">
          <h2>Access Denied</h2>
          <p>Please log in to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="redirect-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Authenticated
  return <>{children}</>
}
