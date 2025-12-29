'use client';

import { ArticleCreationOptions } from "@/components/articles/article-creation-options";
import { useGetArticleByIdQuery } from "@/store/api/articleApi";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditArticlePage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params.id as string;

    const { data: articleData, isLoading, error } = useGetArticleByIdQuery(articleId);

    // Redirect to articles page if article not found
    useEffect(() => {
        if (error) {
            router.push('/articles');
        }
    }, [error, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!articleData?.data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Article not found</p>
                </div>
            </div>
        );
    }

    // Use key prop to force re-render when article data changes
    return <ArticleCreationOptions key={articleData.data._id} existingArticle={articleData.data} />;
}
