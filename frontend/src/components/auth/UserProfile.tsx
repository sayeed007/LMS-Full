'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useLogoutMutation } from '@/store/api/authApi';
import { logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
    } catch (error: any) {
      // Even if server logout fails, clear local state
      dispatch(logout());
      toast.success('Logged out');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">User Profile</h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{user.firstName} {user.lastName}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="text-gray-900 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <p className={`${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Verified</label>
          <p className={`${user.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
            {user.isEmailVerified ? 'Verified' : 'Not Verified'}
          </p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}