import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  variant?: 'header' | 'mobile' | 'sidebar';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  header: {
    base: 'text-gray-600 hover:text-blue-600 px-3 py-1 transition-colors whitespace-nowrap',
    active: 'text-blue-600 font-bold border-b-2 border-blue-600'
  },
  mobile: {
    base: 'block text-gray-600 hover:text-blue-600 px-3 py-3 transition-colors rounded-lg hover:bg-white/20',
    active: 'text-blue-600 bg-white/20'
  },
  sidebar: {
    base: 'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
    active: 'bg-blue-100 text-blue-700'
  }
};

export default function NavigationLink({
  href,
  children,
  isActive = false,
  variant = 'header',
  className,
  onClick
}: NavigationLinkProps) {
  const styles = variantStyles[variant];

  return (
    <Link
      href={href}
      className={cn(
        styles.base,
        isActive && styles.active,
        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}