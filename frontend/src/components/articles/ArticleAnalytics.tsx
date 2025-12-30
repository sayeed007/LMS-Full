'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetArticleAnalyticsQuery } from '@/store/api/articleApi';
import { Eye, ThumbsUp, MessageCircle, TrendingUp, Clock, Calendar, Tag, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface ArticleAnalyticsProps {
  articleId: string;
}

export function ArticleAnalytics({ articleId }: ArticleAnalyticsProps) {
  const { data: analyticsData, isLoading, error } = useGetArticleAnalyticsQuery(articleId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load analytics. You may not have permission to view this data.</p>
      </div>
    );
  }

  const analytics = analyticsData.data;

  // Stat card component
  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Article Analytics</h2>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(analytics.lastUpdated), 'PPp')}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          title="Total Views"
          value={analytics.views.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={ThumbsUp}
          title="Total Likes"
          value={analytics.likes.toLocaleString()}
          subtitle={`${analytics.likeRate}% like rate`}
          color="green"
        />
        <StatCard
          icon={MessageCircle}
          title="Total Comments"
          value={analytics.comments.total}
          subtitle={`${analytics.comments.topLevel} top-level, ${analytics.comments.replies} replies`}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Engagement Rate"
          value={`${analytics.engagement.rate}%`}
          subtitle={`${analytics.engagement.totalInteractions} interactions`}
          color="orange"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Views
                </span>
                <span className="font-semibold text-gray-900">{analytics.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Likes
                </span>
                <span className="font-semibold text-gray-900">{analytics.likes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments
                </span>
                <span className="font-semibold text-gray-900">{analytics.comments.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Interactions
                </span>
                <span className="font-semibold text-gray-900">{analytics.engagement.totalInteractions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Published
                </span>
                <span className="font-semibold text-gray-900">
                  {analytics.publishedAt ? format(new Date(analytics.publishedAt), 'PPP') : 'Not published'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Read Time
                </span>
                <span className="font-semibold text-gray-900">{analytics.readTime || 0} min</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </span>
                <span className="font-semibold text-gray-900">{analytics.category}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Visibility
                </span>
                <span className="font-semibold text-gray-900 capitalize">{analytics.visibility}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  analytics.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : analytics.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {analytics.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags and Versions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.tags && analytics.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tags added</p>
            )}
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{analytics.versions}</p>
              <p className="text-sm text-gray-600 mt-2">
                {analytics.versions === 1 ? 'version saved' : 'versions saved'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
