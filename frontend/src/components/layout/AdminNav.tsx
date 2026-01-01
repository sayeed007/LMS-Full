'use client';

import { usePathname } from 'next/navigation';
import { Container, TabNavLink } from '@/components/ui';

const adminNavItems = [
  { key: 'users', label: 'Users', href: '/admin/users' },
  { key: 'organizations', label: 'Organizations', href: '/admin/organizations' },
  { key: 'pending-courses', label: 'Pending Courses', href: '/admin/courses/pending' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
];

const AdminNav = () => {
  const pathname = usePathname();

  // Check if we're on the admin route or any of its children
  const isAdminRoute = pathname?.startsWith('/admin');

  if (!isAdminRoute) {
    return null;
  }

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname?.startsWith('/admin/users')) return 'users';
    if (pathname?.startsWith('/admin/organizations')) return 'organizations';
    if (pathname?.startsWith('/admin/courses/pending')) return 'pending-courses';
    if (pathname?.startsWith('/admin/settings')) return 'settings';
    return '';
  };

  return (
    <Container size="xl" padding="none" className="mb-6">
      <TabNavLink
        tabs={adminNavItems}
        activeTab={getActiveTab()}
        variant="underline"
      />
    </Container>
  );
};

export default AdminNav;
