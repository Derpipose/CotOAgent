import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page-container flex-center">
      <div className="empty-state">
        <div className="empty-state-icon text-7xl">🚫</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="empty-state-title">Page Not Found</h2>
        <p className="empty-state-description">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary-gradient inline-block">
          Go back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
