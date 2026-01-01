'use client';

import { getErrorMessage } from '@/lib/toast-utils';
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUsersQuery,
  useGetUserStatsQuery,
  type UserPopulated
} from '@/store/api/userApi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';
import { Container, Button, SearchableSelect, Pagination } from '@/components/ui';
import type { SearchableSelectOption } from '@/components/ui';

export default function AdminUsersPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Select options
  const roleOptions: SearchableSelectOption[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'org_admin', label: 'Org Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ];

  const statusOptions: SearchableSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Queries
  const { data, isLoading, error } = useGetUsersQuery({
    page,
    limit,
    search: search || undefined,
    role: roleFilter,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const { data: statsData } = useGetUserStatsQuery();

  // Mutations
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  // Handlers
  const handleActivate = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Activate User',
      message: `Are you sure you want to activate ${name}?`,
      confirmText: 'Activate',
      cancelText: 'Cancel',
      variant: 'info'
    });

    if (!confirmed) return;

    try {
      await activateUser(id).unwrap();
      toast.success('User activated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to activate user'));
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${name}? They will not be able to login.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      await deactivateUser(id).unwrap();
      toast.success('User deactivated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to deactivate user'));
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/users/${id}`);
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Users</h2>
          <p className="text-gray-600">
            {getErrorMessage(error, 'Failed to load users')}
          </p>
        </div>
      </div>
    );
  }

  const users = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  return (
    <Container size='xl'>
      {/* Header */}
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users, roles, and permissions</p>
      </div> */}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Inactive Users</div>
            <div className="text-3xl font-bold text-red-600">{stats.totalUsers - stats.activeUsers}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">By Role</div>
            <div className="space-y-1">
              <div className="text-sm flex justify-between">
                <span className="capitalize">Students:</span>
                <span className="font-semibold">{stats.usersByRole.students}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="capitalize">Instructors:</span>
                <span className="font-semibold">{stats.usersByRole.instructors}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="capitalize">Admins:</span>
                <span className="font-semibold">{stats.usersByRole.admins}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <SearchableSelect
              options={roleOptions}
              value={roleFilter || 'all'}
              onValueChange={(value) => setRoleFilter(value === 'all' ? undefined : value)}
              placeholder="All Roles"
              searchPlaceholder="Search roles..."
              className="w-full"
              clearable
              searchable
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <SearchableSelect
              options={statusOptions}
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
              placeholder="All Status"
              searchPlaceholder="Search status..."
              className="w-full"
              clearable
              searchable={false}
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearch('');
                setRoleFilter(undefined);
                setStatusFilter(undefined);
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: UserPopulated, index: number) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'org_admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : user.role === 'instructor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleView(user._id)}
                        variant="link"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Button>
                      {user.isActive ? (
                        <Button
                          onClick={() => handleDeactivate(user._id, user.name)}
                          variant="link"
                          size="sm"
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleActivate(user._id, user.name)}
                          variant="link"
                          size="sm"
                          className="text-green-600 hover:text-green-900"
                        >
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalResults}
            itemsPerPage={limit}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1); // Reset to first page when changing page size
            }}
          />
        )}
      </div>
    </Container>
  );
}
