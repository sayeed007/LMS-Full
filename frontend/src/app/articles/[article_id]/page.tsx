"use client";

import SingleArticleDetails from "@/components/articles/ArticleDetails";
import { useGetArticleByIdQuery } from "@/store/api/articleApi";
import { useParams, notFound } from "next/navigation";

const ArticleDetails = () => {
    const params = useParams();
    const article_id = params.article_id as string;

    // Fetch article by ID from the API
    const { data, isLoading, error } = useGetArticleByIdQuery(article_id);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500 text-lg">Loading article...</div>
            </div>
        );
    }

    // Error or article not found
    if (error || !data?.data?.article) {
        return notFound();
    }

    return <SingleArticleDetails article={data.data.article} />;
};

export default ArticleDetails;
