'use client';

import { ArticleAnalytics } from '@/components/articles/ArticleAnalytics';
import { PageLayout } from '@/components/ui';
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { useParams } from 'next/navigation';
import { useGetArticleByIdQuery } from '@/store/api/articleApi';

export default function ArticleAnalyticsPage() {
  const params = useParams();
  const articleId = params.id as string;

  const { data: articleData, isLoading } = useGetArticleByIdQuery(articleId);

  return (
    <PageLayout title="">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <GoBackRoute />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLoading ? 'Loading...' : articleData?.data?.article.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Article Analytics & Insights</p>
          </div>
        </div>

        {/* Analytics Component */}
        <ArticleAnalytics articleId={articleId} />
      </div>
    </PageLayout>
  );
}
