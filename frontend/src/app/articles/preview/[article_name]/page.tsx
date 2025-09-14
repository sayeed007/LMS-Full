// app/articles/preview/[article_name]/page.tsx
import ArticlePreviewPage from "@/components/articles/ArticlePreviewPage";

interface PageProps {
    // params: {
    //     article_name: string;
    // };
    searchParams: Promise<{
        content?: string;
        title?: string;
        author?: string;
        category?: string;
    }>;
}

export default async function ArticlePreview({
    // params,
    searchParams
}: PageProps) {
    // Await searchParams to resolve the Promise
    const resolvedSearchParams = await searchParams;

    // Decode the content from URL parameters
    const editorContent = resolvedSearchParams.content
        ? decodeURIComponent(resolvedSearchParams.content)
        : null;

    const articleTitle = resolvedSearchParams.title
        ? decodeURIComponent(resolvedSearchParams.title)
        : "Untitled Article";

    const authorName = resolvedSearchParams.author
        ? decodeURIComponent(resolvedSearchParams.author)
        : "Anonymous";

    const category = resolvedSearchParams.category
        ? decodeURIComponent(resolvedSearchParams.category)
        : "General";

    return (
        <ArticlePreviewPage
            editorContent={editorContent || ""}
            articleTitle={articleTitle}
            authorName={authorName}
            category={category}
        />
    );
}

// Optional: Generate metadata for the page
// export async function generateMetadata({ params, searchParams }: PageProps) {
//     const resolvedSearchParams = await searchParams;
//     const resolveParams = await params;

//     const title = resolvedSearchParams.title
//         ? decodeURIComponent(resolvedSearchParams.title)
//         : ;

//     return {
//         title: `Preview: ${title}`,
//         description: "Article preview page",
//     };
// }