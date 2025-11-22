import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import '../css/sidebar.css'

interface NavLink {
  label: string
  path: string
  requiresAdmin?: boolean
  requiresAuth?: boolean
}

const SideNavBar = () => {
  const location = useLocation()
  const { isAdmin, isAuthenticated } = useAuth()
  
  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Races', path: '/races', requiresAuth: true },
    { label: 'Classes', path: '/classes', requiresAuth: true },
    { label: 'Spells', path: '/spells', requiresAuth: true },
    { label: 'Character Sheet', path: '/character-sheet', requiresAuth: true },
    { label: 'My Characters', path: '/characters', requiresAuth: true },
    { label: 'Admin', path: '/admin', requiresAdmin: true },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const visibleLinks = navLinks.filter((link) => {
    if (link.requiresAdmin) {
      return isAdmin === true
    }
    if (link.requiresAuth) {
      return isAuthenticated === true
    }
    return true
  })

  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Menu</h2>
        <ul className="nav-list">
          {visibleLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default SideNavBar
