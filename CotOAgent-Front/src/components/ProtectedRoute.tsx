import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import '../css/protected-route.css'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin'
}

/**
 * ProtectedRoute component that requires authentication and optionally specific roles
 * @param children - The component to render if authorized
 * @param requiredRole - Optional role requirement (currently supports 'admin')
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isInitialized, isAuthenticated, isAdmin } = useAuth()

  // Still loading auth
  if (!isInitialized) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading">Verifying access...</div>
      </div>
    )
  }

  // Not authenticated
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

  // Check for required role
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="auth-error-container">
        <div className="auth-error">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page</p>
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

  // Authorized
  return <>{children}</>
}
