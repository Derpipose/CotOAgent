import type { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function ContentCard({ children, className = '', variant = 'default' }: ContentCardProps) {
  const variantClasses = {
    default: 'content-card content-card-default',
    elevated: 'content-card content-card-elevated',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
