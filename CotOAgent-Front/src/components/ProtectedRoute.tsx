import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isInitialized, isAuthenticated, isAdmin } = useAuth()

  if (!isInitialized) {
    return (
      <div className="protected-route-container">
        <div className="protected-route-error-title">Verifying access...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-route-container">
        <div className="protected-route-error-box">
          <h2 className="protected-route-error-title">Access Denied</h2>
          <p className="protected-route-error-message">Please log in to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="protected-route-error-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="protected-route-container">
        <div className="protected-route-error-box">
          <h2 className="protected-route-error-title">Access Denied</h2>
          <p className="protected-route-error-message">You do not have permission to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="protected-route-error-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
