import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  disabled?: boolean;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'contained';
}

const variantStyles = {
  underline: {
    container: 'flex gap-1 border-b border-gray-200',
    tab: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
    active: 'border-blue-600 text-blue-600 font-bold',
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

export default function TabNav({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'underline'
}: TabNavProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cn(
            styles.tab,
            activeTab === tab.key ? styles.active : styles.inactive,
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !tab.disabled && onTabChange(tab.key)}
          disabled={tab.disabled}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}