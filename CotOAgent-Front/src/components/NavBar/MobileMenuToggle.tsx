interface MobileMenuToggleProps {
  isOpen: boolean
  onChange: (isOpen: boolean) => void
}

export function MobileMenuToggle({ isOpen, onChange }: MobileMenuToggleProps) {
  return (
    <button
      className="lg:hidden flex flex-col bg-none border-none cursor-pointer p-2 gap-1"
      onClick={() => onChange(!isOpen)}
      aria-label="Toggle navigation menu"
    >
      <span className="w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
      <span className="w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
      <span className="w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
    </button>
  )
}
