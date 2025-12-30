'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/userApi';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/toast-utils';
import Image from 'next/image';
import { useConfirm } from '@/hooks/useConfirm';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const confirm = useConfirm();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'org_admin' | 'super_admin';
    bio: string;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    role: 'student',
    bio: '',
    isActive: true,
  });

  // Queries
  const { data, isLoading, error } = useGetUserByIdQuery(userId);

  // Mutations
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const user = data?.data?.user;

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        bio: user.bio || '',
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  // Handlers
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUser({
        id: userId,
        data: formData,
      }).unwrap();

      toast.success('User updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    }
  };

  const handleActivate = async () => {
    const confirmed = await confirm({
      title: 'Activate User',
      message: `Are you sure you want to activate ${user?.name}?`,
      confirmText: 'Activate',
      cancelText: 'Cancel',
      variant: 'info'
    });

    if (!confirmed) return;

    try {
      await activateUser(userId).unwrap();
      toast.success('User activated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to activate user'));
    }
  };

  const handleDeactivate = async () => {
    const confirmed = await confirm({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user?.name}?`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      await deactivateUser(userId).unwrap();
      toast.success('User deactivated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to deactivate user'));
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user?.name}? This action will deactivate their account.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteUser(userId).unwrap();
      toast.success('User deleted successfully');
      router.push('/admin/users');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to delete user'));
    }
  };

  // Loading state
  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading User</h2>
          <p className="text-gray-600">
            {getErrorMessage(error, 'Failed to load user details')}
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <Link
            href="/admin/users"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Users
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>
          <div className="flex space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User Information</h3>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'instructor' | 'org_admin' | 'super_admin' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="org_admin">Org Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="User bio..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Account</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form
                if (user) {
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || 'student',
                    bio: user.bio || '',
                    isActive: user.isActive ?? true,
                  });
                }
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
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
                    {user.role?.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </dd>
              </div>
            </dl>

            {user.bio && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.bio}</dd>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {user.isActive ? (
                <button
                  onClick={handleDeactivate}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Deactivate User
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Activate User
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
