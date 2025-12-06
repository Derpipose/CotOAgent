import { NavLinksList } from './NavLinksList'

interface NavLinkItem {
  label: string
  path: string
  requiresAdmin?: boolean
  requiresAuth?: boolean
}

interface MobileNavProps {
  isMenuOpen: boolean
  links: NavLinkItem[]
  activePath: string
  onLinkClick: () => void
}

export function MobileNav({ isMenuOpen, links, activePath, onLinkClick }: MobileNavProps) {
  return (
    <nav
      className={`w-full lg:hidden bg-blue-100 text-slate-600 shadow-lg z-50 flex flex-col overflow-hidden ${
        isMenuOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="w-full h-full flex flex-col items-stretch p-0 relative box-border overflow-hidden">
        <NavLinksList links={links} activePath={activePath} onLinkClick={onLinkClick} />
      </div>
    </nav>
  )
}
