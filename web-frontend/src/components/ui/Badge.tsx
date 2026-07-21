import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'count' | 'status' | 'new' | 'warning' | 'success' | 'brand';
  label?: string | number;
}

const variantClasses = {
  count: 'bg-[var(--error)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] inline-flex justify-center items-center',
  status: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5',
  new: 'bg-[var(--brand)]/10 text-[var(--brand)] text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] inline-flex items-center',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] inline-flex items-center',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] inline-flex items-center',
  brand: 'bg-[var(--brand)] text-[var(--brand-foreground)] text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] inline-flex items-center',
};

export function Badge({ variant = 'new', label, className = '', children, ...props }: BadgeProps) {
  if (variant === 'status') {
    return (
      <span className={`${variantClasses.status} ${className}`} {...props}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
        {label || children}
      </span>
    );
  }

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {label || children}
    </span>
  );
}
