import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import '../css/sidebar.css'

interface NavLink {
  label: string
  path: string
  requiresAdmin?: boolean
}

const SideNavBar = () => {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Races', path: '/races' },
    { label: 'Classes', path: '/classes' },
    { label: 'Spells', path: '/spells' },
    { label: 'My Characters', path: '/characters' },
    { label: 'Character Sheet', path: '/character-sheet' },
    { label: 'About', path: '/about' },
    { label: 'Admin', path: '/admin', requiresAdmin: true },
    { label: 'Contact', path: '/contact' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const visibleLinks = navLinks.filter((link) => {
    if (link.requiresAdmin) {
      return isAdmin === true
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
