import { NavLink } from './NavLink'

interface NavLinkItem {
  label: string
  path: string
  requiresAdmin?: boolean
  requiresAuth?: boolean
}

interface NavLinksListProps {
  links: NavLinkItem[]
  activePath: string
  onLinkClick: () => void
}

export function NavLinksList({ links, activePath, onLinkClick }: NavLinksListProps) {
  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-0 flex-1 justify-start box-border">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          label={link.label}
          isActive={activePath === link.path}
          onClick={onLinkClick}
        />
      ))}
    </ul>
  )
}
