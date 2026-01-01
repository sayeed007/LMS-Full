import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TabLink {
  key: string;
  label: string;
  href: string;
  disabled?: boolean;
}

interface TabNavLinkProps {
  tabs: TabLink[];
  activeTab: string;
  className?: string;
  variant?: 'underline' | 'pills' | 'contained';
}

const variantStyles = {
  underline: {
    container: 'flex gap-1 border-b border-gray-200',
    tab: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors relative',
    active: 'border-blue-600 text-blue-600 font-bold -mb-px',
    inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  },
  pills: {
    container: 'flex gap-2',
    tab: 'px-4 py-2 text-sm font-medium rounded-full transition-colors',
    active: 'bg-blue-600 text-white',
    inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  },
  contained: {
    container: 'flex bg-gray-100 p-1 rounded-lg',
    tab: 'px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 text-center',
    active: 'bg-white text-blue-600 shadow-sm',
    inactive: 'text-gray-500 hover:text-gray-700'
  }
};

export default function TabNavLink({
  tabs,
  activeTab,
  className,
  variant = 'underline'
}: TabNavLinkProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            styles.tab,
            activeTab === tab.key ? styles.active : styles.inactive,
            tab.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
          aria-disabled={tab.disabled}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
