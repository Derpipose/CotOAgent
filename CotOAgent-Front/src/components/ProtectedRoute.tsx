import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

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
      <div className="flex justify-center items-center min-h-[calc(100vh-250px)] ml-[250px]">
        <div className="text-lg text-gray-600 font-medium">Verifying access...</div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-250px)] ml-[250px]">
        <div className="bg-red-100 border border-red-400 rounded-lg p-8 max-w-sm text-center text-red-900">
          <h2 className="mt-0 text-red-900">Access Denied</h2>
          <p className="my-2">Please log in to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-900 text-white border-none px-6 py-3 rounded text-base cursor-pointer mt-4 transition-colors duration-300 hover:bg-red-800"
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
      <div className="flex justify-center items-center min-h-[calc(100vh-250px)] ml-[250px]">
        <div className="bg-red-100 border border-red-400 rounded-lg p-8 max-w-sm text-center text-red-900">
          <h2 className="mt-0 text-red-900">Access Denied</h2>
          <p className="my-2">You do not have permission to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-900 text-white border-none px-6 py-3 rounded text-base cursor-pointer mt-4 transition-colors duration-300 hover:bg-red-800"
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
