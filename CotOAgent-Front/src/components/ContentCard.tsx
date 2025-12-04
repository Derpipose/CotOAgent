import type { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function ContentCard({ children, className = '', variant = 'default' }: ContentCardProps) {
  const variantClasses = {
    default: 'bg-blue-200 rounded-lg shadow-md border border-gray-200 p-6',
    elevated: 'bg-blue-200 rounded-xl shadow-xl border-2 border-gray-300 p-6',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
