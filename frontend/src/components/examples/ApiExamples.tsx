'use client';

import React, { useState } from 'react';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetArticlesQuery } from '@/store/api/articleApi';
import { useGetUsersQuery } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

export default function ApiExamples() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'courses' | 'articles' | 'users'>('courses');

  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError
  } = useGetCoursesQuery({ page: 1, limit: 5 });

  const {
    data: articlesData,
    isLoading: articlesLoading,
    error: articlesError
  } = useGetArticlesQuery({ page: 1, limit: 5 });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useGetUsersQuery(
    { page: 1, limit: 5 },
    { skip: !isAuthenticated }
  );

  const tabs = [
    { key: 'courses', label: 'Courses', requiresAuth: false },
    { key: 'articles', label: 'Articles', requiresAuth: false },
    { key: 'users', label: 'Users', requiresAuth: true },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">API Examples</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'courses' | 'articles' | 'users')}
              disabled={tab.requiresAuth && !isAuthenticated}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tab.requiresAuth && !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.label}
              {tab.requiresAuth && !isAuthenticated && ' (Login Required)'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'courses' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Courses</h3>
            {coursesLoading && <p>Loading courses...</p>}
            {coursesError && (
              <p className="text-red-600">
                Error: {(coursesError as ApiError)?.data?.message || 'Failed to load courses'}
              </p>
            )}
            {coursesData?.data && (
              <div className="space-y-3">
                {coursesData.data.map((course) => (
                  <div key={course._id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg">{course.title}</h4>
                    <p className="text-gray-600 text-sm">{course.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'articles' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Articles</h3>
            {articlesLoading && <p>Loading articles...</p>}
            {articlesError && (
              <p className="text-red-600">
                Error: {(articlesError as ApiError)?.data?.message || 'Failed to load articles'}
              </p>
            )}
            {articlesData?.data && (
              <div className="space-y-3">
                {articlesData.data.map((article) => (
                  <div key={article._id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg">{article.title}</h4>
                    <p className="text-gray-600 text-sm">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>👁 {article.views}</span>
                        <span>❤️ {article.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Users</h3>
              <button
                onClick={() => refetchUsers()}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
            {!isAuthenticated && (
              <p className="text-yellow-600">Please log in to view users.</p>
            )}
            {usersLoading && <p>Loading users...</p>}
            {usersError && (
              <p className="text-red-600">
                Error: {(usersError as ApiError)?.data?.message || 'Failed to load users'}
              </p>
            )}
            {usersData?.data && (
              <div className="space-y-3">
                {usersData.data.map((user) => (
                  <div key={user._id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg">{user.name}</h4>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {user.role.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}