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
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-white/50 max-w-md mb-6">{description}</p>}
      {cta && <div>{cta}</div>}
    </div>
  );
}
