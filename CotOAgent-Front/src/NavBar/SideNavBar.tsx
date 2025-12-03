import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'

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
    <nav className="w-64 h-screen bg-slate-700 text-gray-100 shadow-lg z-50 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col items-stretch p-0 relative box-border overflow-hidden">
        <div className="flex items-center w-full px-5 mb-7">
          <Link to="/" className="text-2xl font-bold text-blue-400 no-underline transition-colors duration-300 hover:text-blue-300 whitespace-nowrap">
            Chronicles
          </Link>
        </div>

        <button
          className={`hidden md:hidden flex-col bg-none border-none cursor-pointer p-2 ml-auto mr-5 mt-0 gap-1 ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="w-6 h-0.5 bg-gray-100 transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-gray-100 transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-gray-100 transition-all duration-300"></span>
        </button>

        <ul className={`list-none p-0 m-0 flex flex-col gap-0 flex-1 justify-start box-border transition-all duration-300 ${isMenuOpen ? 'block' : 'md:block hidden'}`}>
          {visibleLinks.map((link) => (
            <li key={link.path} className="m-0 box-border">
              <Link
                to={link.path}
                className={`block px-5 py-3 text-gray-300 no-underline rounded-none transition-all duration-300 text-sm font-medium w-full border-l-4 border-l-transparent box-border ${
                  isActive(link.path)
                    ? 'bg-blue-500 text-white font-semibold border-l-blue-900'
                    : 'hover:bg-slate-800 hover:text-gray-100 hover:border-l-blue-400'
                }`}
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
