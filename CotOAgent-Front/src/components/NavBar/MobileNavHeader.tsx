import { NavLogo } from './NavLogo'
import { MobileMenuToggle } from './MobileMenuToggle'

interface MobileNavHeaderProps {
  isMenuOpen: boolean
  onMenuToggle: (isOpen: boolean) => void
}

export function MobileNavHeader({ isMenuOpen, onMenuToggle }: MobileNavHeaderProps) {
  return (
    <div className="lg:hidden w-full bg-blue-100 text-slate-600 shadow-lg z-50 flex items-center justify-between px-5 py-4">
      <NavLogo />
      <MobileMenuToggle isOpen={isMenuOpen} onChange={onMenuToggle} />
    </div>
  )
}
