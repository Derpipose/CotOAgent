import { NavLogo } from './NavLogo'
import { NavLinksList } from './NavLinksList'

interface NavLinkItem {
  label: string
  path: string
  requiresAdmin?: boolean
  requiresAuth?: boolean
}

interface DesktopNavProps {
  links: NavLinkItem[]
  activePath: string
  onLinkClick: () => void
}

export function DesktopNav({ links, activePath, onLinkClick }: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex w-64 h-screen bg-blue-100 text-slate-600 shadow-lg z-50 flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col items-stretch p-0 relative box-border overflow-hidden">
        {/* Logo (Desktop only) */}
        <div className="flex items-center w-full px-5 mb-7">
          <NavLogo isDesktop={true} />
        </div>

        <NavLinksList links={links} activePath={activePath} onLinkClick={onLinkClick} />
      </div>
    </nav>
  )
}
