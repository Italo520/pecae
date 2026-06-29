'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'filter' | 'category';
  className?: string;
}

const variantClasses = {
  filter: 'bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20',
  category: 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]',
};

export function Chip({ label, onRemove, variant = 'filter', className = '' }: ChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-lg)] text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1"
          aria-label={`Remover filtro ${label}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
