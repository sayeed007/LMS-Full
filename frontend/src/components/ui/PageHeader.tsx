import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeVariants = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl'
};

export default function PageHeader({ 
  title, 
  children, 
  className,
  size = 'lg'
}: PageHeaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-between mb-6',
      className
    )}>
      <div className="flex items-center gap-8">
        <h1 className={cn(
          'font-semibold text-gray-900',
          sizeVariants[size]
        )}>
          {title}
        </h1>
      </div>
      
      {children && (
        <div className="flex items-center gap-4">
          {children}
        </div>
      )}
    </div>
  );
}