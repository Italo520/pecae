'use client';

import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-vibrant)] active:bg-[var(--brand)]',
  secondary: 'bg-[var(--muted)] text-white hover:opacity-90',
  outline: 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]',
  ghost: 'text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10',
  destructive: 'bg-[var(--error)] text-white hover:opacity-90',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg font-medium',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-medium';
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2" variant="current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
