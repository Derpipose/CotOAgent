import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { MobileNavHeader, DesktopNav, MobileNav } from '../components/NavBar'

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
    <div className="flex flex-col lg:flex-row w-full lg:w-64 lg:h-screen">
      <MobileNavHeader isMenuOpen={isMenuOpen} onMenuToggle={setIsMenuOpen} />
      <DesktopNav links={visibleLinks} activePath={location.pathname} onLinkClick={handleLinkClick} />
      <MobileNav
        isMenuOpen={isMenuOpen}
        links={visibleLinks}
        activePath={location.pathname}
        onLinkClick={handleLinkClick}
      />
    </div>
  )
}

export default SideNavBar
