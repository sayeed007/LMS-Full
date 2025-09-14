import SingleArticleDetails from "@/components/articles/ArticleDetails";
import { dummyArticles } from "@/dummyData/articles";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        article_name: string;
    }>;
}

const ArticleDetails = async ({ params }: PageProps) => {
    const resolvedParams = await params;

    const decodedTitle = decodeURIComponent(resolvedParams.article_name || "");

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

    if (!resolvedParams.article_name) {
        return {
            title: "Article Not Found",
            description: "No article title provided",
        };
    }

    const decodedTitle = decodeURIComponent(resolvedParams.article_name);
    const article = dummyArticles.find(
        (a) =>
            a.title.toLowerCase().trim() === decodedTitle.toLowerCase().trim()
    );

    return {
        title: article ? `Article: ${article.title}` : "Article Not Found",
        description: article ? "Read the full article" : "Article not found",
    };
}






































// import SingleArticleDetails from "@/components/articles/ArticleDetails";
// import { dummyArticles } from "@/dummyData/articles";
// import { notFound } from "next/navigation";

// // Use a more flexible type for params to satisfy Next.js's type checker
// interface PageProps {
//     params: Promise<Record<string, string>>;
// }

// const ArticleDetails = async ({ params }: PageProps) => {
//     // Await params to resolve the Promise
//     const resolvedParams = await params;

//     if (!resolvedParams.article_name) {
//         console.error("Error: params.article_name is undefined");
//         notFound();
//     }

//     // Decode the article_name and find the matching article
//     const decodedTitle = decodeURIComponent(resolvedParams.article_name);

//     // Normalize titles for comparison
//     const article = dummyArticles.find(
//         (a) => a.title.toLowerCase().trim() === decodedTitle.toLowerCase().trim()
//     );

//     if (!article) {
//         console.info("No article found for title:", decodedTitle);
//         console.info("Available titles:", dummyArticles.map((a) => a.title));
//         notFound();
//     }

//     return (
//         <SingleArticleDetails
//             article={article}
//         />
//     )
// }

// export default ArticleDetails;

// export async function generateMetadata({ params }: PageProps) {
//     const resolvedParams = await params;

//     if (!resolvedParams.article_name) {
//         return {
//             title: "Article Not Found",
//             description: "No article title provided",
//         };
//     }

//     const decodedTitle = decodeURIComponent(resolvedParams.article_name);
//     const article = dummyArticles.find(
//         (a) => a.title.toLowerCase().trim() === decodedTitle.toLowerCase().trim()
//     );

//     return {
//         title: article ? `Article: ${article.title}` : "Article Not Found",
//         description: article ? "Read the full article" : "Article not found",
//     };
// }