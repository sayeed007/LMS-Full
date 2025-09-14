import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeVariants = {
  sm: 'w-48 h-8',
  md: 'w-64 h-10', 
  lg: 'w-80 h-12'
};

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search here',
  className,
  size = 'md'
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'pl-10 border-gray-200',
          sizeVariants[size]
        )}
      />
    </div>
  );
}