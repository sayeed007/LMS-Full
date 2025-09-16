'use client';

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/ui/Container';
import SearchInput from '@/components/ui/SearchInput';
import TabNav from '@/components/ui/TabNav';
import NavigationLink from '@/components/ui/NavigationLink';
import { Button } from '@/components/ui/button';

export default function DesignSystemDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('components');
  const [activeVariant, setActiveVariant] = useState('underline');

  const tabs = [
    { key: 'components', label: 'Components' },
    { key: 'layouts', label: 'Layouts' },
    { key: 'examples', label: 'Examples' }
  ];

  const variantTabs = [
    { key: 'underline', label: 'Underline' },
    { key: 'pills', label: 'Pills' },
    { key: 'contained', label: 'Contained' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Example 1: Using PageLayout (Recommended for most pages) */}
      <PageLayout
        title="Design System Demo"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search design system..."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerActions={
          <Button>Create New</Button>
        }
      >
        <div className="space-y-8">

          {/* Component Examples Section */}
          {activeTab === 'components' && (
            <div className="grid gap-8">

              {/* Search Input Examples */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Search Input Variants</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <SearchInput
                    value=""
                    onChange={() => { }}
                    placeholder="Small search"
                    size="sm"
                  />
                  <SearchInput
                    value=""
                    onChange={() => { }}
                    placeholder="Medium search (default)"
                    size="md"
                  />
                  <SearchInput
                    value=""
                    onChange={() => { }}
                    placeholder="Large search"
                    size="lg"
                  />
                </div>
              </div>

              {/* Tab Navigation Examples */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Tab Navigation Variants</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Current Variant: {activeVariant}</h4>
                    <TabNav
                      tabs={variantTabs}
                      activeTab={activeVariant}
                      onTabChange={setActiveVariant}
                      variant="pills"
                      className="mb-4"
                    />
                    <TabNav
                      tabs={[
                        { key: 'home', label: 'Home' },
                        { key: 'about', label: 'About' },
                        { key: 'services', label: 'Services' },
                        { key: 'contact', label: 'Contact' }
                      ]}
                      activeTab="home"
                      onTabChange={() => { }}
                      variant={activeVariant as any}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Link Examples */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Navigation Link Variants</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Header Style</h4>
                    <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
                      <NavigationLink href="#" variant="header" isActive>Dashboard</NavigationLink>
                      <NavigationLink href="#" variant="header">Courses</NavigationLink>
                      <NavigationLink href="#" variant="header">Articles</NavigationLink>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Sidebar Style</h4>
                    <div className="w-48 space-y-1 bg-gray-50 p-2 rounded">
                      <NavigationLink href="#" variant="sidebar" isActive>Dashboard</NavigationLink>
                      <NavigationLink href="#" variant="sidebar">Courses</NavigationLink>
                      <NavigationLink href="#" variant="sidebar">Articles</NavigationLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Examples */}
          {activeTab === 'layouts' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Container Sizes</h3>
                <div className="space-y-4">
                  {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(size => (
                    <div key={size} className="border-2 border-dashed border-gray-300">
                      <Container size={size} padding="sm" className="bg-blue-50">
                        <p className="text-center text-sm text-gray-600">
                          Container size: {size} - {size === 'full' ? 'Full width' : `max-w-${size === 'sm' ? '2xl' : size === 'md' ? '4xl' : size === 'lg' ? '6xl' : '7xl'}`}
                        </p>
                      </Container>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real-world Examples */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>

                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">1. Simple Page with Search:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {`<PageLayout
  title="My Articles"
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
>
  <ArticlesList />
</PageLayout>`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Page with Tabs and Actions:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {`<PageLayout
  title="Course Management"
  tabs={[
    { key: 'all', label: 'All Courses' },
    { key: 'draft', label: 'Drafts' }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  headerActions={<Button>Create Course</Button>}
>
  <CourseList />
</PageLayout>`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Custom Layout:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {`<Container size="lg" padding="lg">
  <PageHeader title="Custom Layout">
    <SearchInput value={search} onChange={setSearch} />
  </PageHeader>
  <TabNav tabs={tabs} activeTab={tab} onTabChange={setTab} />
  <YourContent />
</Container>`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
}