import React from 'react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import TabNav from '@/components/ui/TabNav';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  disabled?: boolean;
}

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  
  // Optional search functionality
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Optional tabs
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
  tabVariant?: 'underline' | 'pills' | 'contained';
  
  // Layout customization
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  containerPadding?: 'none' | 'sm' | 'md' | 'lg';
  headerSize?: 'sm' | 'md' | 'lg';
  
  // Additional actions in header
  headerActions?: React.ReactNode;
  
  className?: string;
}

export default function PageLayout({
  title,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  tabs,
  activeTab,
  onTabChange,
  tabVariant = 'underline',
  containerSize = 'xl',
  containerPadding = 'md',
  headerSize = 'lg',
  headerActions,
  className
}: PageLayoutProps) {
  const showSearch = searchValue !== undefined && onSearchChange;
  const showTabs = tabs && activeTab && onTabChange;

  return (
    <Container 
      size={containerSize} 
      padding={containerPadding}
      className={className}
    >
      {/* Page Header with optional search and actions */}
      <PageHeader title={title} size={headerSize}>
        <div className="flex items-center gap-4">
          {showSearch && (
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          )}
          {headerActions}
        </div>
      </PageHeader>

      {/* Optional Tab Navigation */}
      {showTabs && (
        <div className="mb-6">
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            variant={tabVariant}
          />
        </div>
      )}

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </Container>
  );
}