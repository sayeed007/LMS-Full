'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';

export default function SessionSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session) {
      // Sync NextAuth session to Redux store
      if (session.backendToken && session.user) {
        dispatch(setCredentials({
          user: {
            _id: session.user.id || '',
            firstName: session.user.name?.split(' ')[0] || '',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            role: (session.user.role as "student" | "instructor" | "org_admin" | "super_admin") || 'student',
            isActive: true,
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: session.backendToken,
        }));
      }
    } else if (status === 'unauthenticated') {
      // Clear Redux state when user is not authenticated
      dispatch(logout());
    }
  }, [session, status, dispatch]);

  return null; // This component doesn't render anything
}