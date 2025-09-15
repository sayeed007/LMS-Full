import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const sizeVariants = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

const paddingVariants = {
  none: '',
  sm: 'px-4 py-6',
  md: 'px-4 py-8 lg:px-8 lg:py-10',
  lg: 'px-6 py-12 lg:px-12'
};

export default function Container({
  children,
  className,
  size = 'full',
  padding = 'none'
}: ContainerProps) {
  return (
    <div className={cn(
      'container mx-auto',
      sizeVariants[size],
      paddingVariants[padding],
      className
    )}>
      {children}
    </div>
  );
}