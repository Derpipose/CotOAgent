import { Link } from 'react-router-dom'

interface NavLogoProps {
  isDesktop?: boolean
}

export function NavLogo({ isDesktop = false }: NavLogoProps) {
  const logoText = isDesktop ? 'Chronicles' : 'Chronicles of the Omuns'

  return (
    <Link
      to="/"
      className="text-2xl font-bold text-indigo-500 no-underline transition-colors duration-300 hover:text-indigo-600 whitespace-nowrap"
    >
      {logoText}
    </Link>
  )
}
