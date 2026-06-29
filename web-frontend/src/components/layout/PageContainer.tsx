import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className = '', children, ...props }: PageContainerProps) {
  return (
    <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-8 ${className}`} {...props}>
      {children}
    </main>
  );
}
