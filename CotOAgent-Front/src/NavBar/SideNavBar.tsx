import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../css/navbar.css'

interface NavLink {
  label: string
  path: string
  requiresAdmin?: boolean
  requiresAuth?: boolean
}

const SideNavBar = () => {
  const location = useLocation()
  const { isAdmin, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
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

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            Chronicles
          </Link>
        </div>

        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
          {visibleLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={handleLinkClick}
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
