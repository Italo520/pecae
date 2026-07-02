import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] h-full w-full">
      {icon && (
        <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--muted)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--muted)] max-w-md mb-6">{description}</p>}
      {cta && <div>{cta}</div>}
    </div>
  );
}
