import { Link } from 'react-router-dom'

interface NavLinkProps {
  to: string
  label: string
  isActive: boolean
  onClick: () => void
}

export function NavLink({ to, label, isActive, onClick }: NavLinkProps) {
  return (
    <li className="m-0 box-border">
      <Link
        to={to}
        className={`block px-5 py-3 text-slate-600 no-underline rounded-none transition-all duration-300 text-sm font-medium w-full border-l-4 border-l-transparent box-border ${
          isActive
            ? 'bg-blue-200 text-slate-700 font-semibold border-l-indigo-400'
            : 'hover:bg-blue-50 hover:text-slate-700 hover:border-l-indigo-300'
        }`}
        onClick={onClick}
      >
        {label}
      </Link>
    </li>
  )
}
