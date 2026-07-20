import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'card' | 'image';
  width?: string | number;
  height?: string | number;
}

const variantClasses = {
  text: 'rounded-[var(--radius-sm)]',
  circle: 'rounded-full',
  card: 'rounded-[var(--radius-md)]',
  image: 'rounded-[var(--radius-sm)]',
};

export function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  className = '', 
  style, 
  ...props 
}: SkeletonProps) {
  
  const baseStyle: React.CSSProperties = { ...style };
  
  if (width !== undefined) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
  
  if (height !== undefined) {
    baseStyle.height = typeof height === 'number' ? `${height}px` : height;
  } else if (variant === 'text' && !baseStyle.height) {
    baseStyle.height = '1.25rem';
  } else if (variant === 'card' && !baseStyle.height) {
    baseStyle.height = '12rem';
  }
  
  // if variant is circle and height is set but width isn't, match them
  if (variant === 'circle' && baseStyle.height && !baseStyle.width) {
    baseStyle.width = baseStyle.height;
  } else if (variant === 'circle' && baseStyle.width && !baseStyle.height) {
    baseStyle.height = baseStyle.width;
  }

  return (
    <div
      className={`bg-[var(--border)] shimmer ${variantClasses[variant]} ${className}`}
      style={baseStyle}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton variant="circle" className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-[var(--color-border)]">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton variant="circle" className="h-10 w-10" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
