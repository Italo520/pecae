import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className = '', elevated = false, children, ...props }: CardProps) {
  const baseClasses = 'bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden';
  const elevatedClasses = elevated ? 'shadow-lg backdrop-blur-[var(--blur)]' : '';

  return (
    <div className={`${baseClasses} ${elevatedClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
