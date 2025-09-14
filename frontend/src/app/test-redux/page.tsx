'use client';

import LoginForm from '@/components/auth/LoginForm';
import UserProfile from '@/components/auth/UserProfile';
import ApiExamples from '@/components/examples/ApiExamples';
import { useAppSelector } from '@/store/hooks';

export default function TestReduxPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Redux Toolkit + RTK Query Test
        </h1>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Authentication Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Authentication</h2>
            
            {!isAuthenticated ? (
              <LoginForm />
            ) : (
              <UserProfile />
            )}
          </div>
          
          {/* API Examples Section */}
          <div>
            <ApiExamples />
          </div>
        </div>
        
        {/* Debug Information */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName} (${user.role})` : 'None'}</p>
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}</p>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p>1. <strong>Backend Required:</strong> Make sure your backend is running on port 5000</p>
            <p>2. <strong>Test Login:</strong> Use the login form to authenticate (if you have user credentials)</p>
            <p>3. <strong>API Testing:</strong> Use the tabs to test different API endpoints</p>
            <p>4. <strong>Persistence:</strong> Refresh the page - your auth state should persist</p>
            <p>5. <strong>Network Tab:</strong> Open DevTools Network tab to see API calls</p>
          </div>
        </div>
      </div>
    </div>
  );
}