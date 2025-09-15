import SingleArticleDetails from "@/components/articles/ArticleDetails";
import { dummyArticles } from "@/dummyData/articles";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        article_id: string;
    }>;
}

const ArticleDetails = async ({ params }: PageProps) => {
    const resolvedParams = await params;

    const decodedTitle = decodeURIComponent(resolvedParams.article_id || "");

    const article = dummyArticles.find(
        (a) =>
            a.title.toLowerCase().trim() === decodedTitle.toLowerCase().trim()
    );

    if (!article) {
        return notFound();
    }

    return <SingleArticleDetails article={article} />;
};

export default ArticleDetails;

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;

    if (!resolvedParams.article_id) {
        return {
            title: "Article Not Found",
            description: "No article title provided",
        };
    }

    const decodedTitle = decodeURIComponent(resolvedParams.article_id);
    const article = dummyArticles.find(
        (a) =>
            a.title.toLowerCase().trim() === decodedTitle.toLowerCase().trim()
    );

    return {
        title: article ? `Article: ${article.title}` : "Article Not Found",
        description: article ? "Read the full article" : "Article not found",
    };
}
