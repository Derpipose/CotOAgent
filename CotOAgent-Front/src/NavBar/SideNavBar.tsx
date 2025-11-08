import { useLocation, Link } from 'react-router-dom'
import '../css/sidebar.css'

interface NavLink {
  label: string
  path: string
}

const SideNavBar = () => {
  const location = useLocation()

  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Races', path: '/races' },
    { label: 'Classes', path: '/classes' },
    { label: 'Spells', path: '/spells' },
    { label: 'Character Sheet', path: '/character-sheet' },
    { label: 'About', path: '/about' },
    { label: 'Admin', path: '/admin' },
    { label: 'Contact', path: '/contact' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Menu</h2>
        <ul className="nav-list">
          {navLinks.map((link) => (
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
