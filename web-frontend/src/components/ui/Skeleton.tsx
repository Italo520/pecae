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
      className={`bg-[var(--border)] animate-pulse ${variantClasses[variant]} ${className}`}
      style={baseStyle}
      {...props}
    />
  );
}
