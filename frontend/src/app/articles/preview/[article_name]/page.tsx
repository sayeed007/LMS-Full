// app/articles/preview/[article_name]/page.tsx
"use client";

import SingleArticleDetails from "@/components/articles/ArticleDetails";
import { ArticlePopulated } from "@/store/api/articleApi";
import { useSearchParams } from "next/navigation";

export default function ArticlePreview() {
    const searchParams = useSearchParams();

    // Decode the content from URL parameters
    const editorContent = searchParams.get('content')
        ? decodeURIComponent(searchParams.get('content')!)
        : "";

    const articleTitle = searchParams.get('title')
        ? decodeURIComponent(searchParams.get('title')!)
        : "Untitled Article";

    const authorName = searchParams.get('author')
        ? decodeURIComponent(searchParams.get('author')!)
        : "Anonymous";

    const category = searchParams.get('category')
        ? decodeURIComponent(searchParams.get('category')!)
        : "General";

    let tags: string[] = [];
    try {
        tags = searchParams.get('tags')
            ? JSON.parse(decodeURIComponent(searchParams.get('tags')!))
            : [];
    } catch (error) {
        console.error('Error parsing tags:', error);
        tags = [];
    }

    const excerpt = searchParams.get('excerpt')
        ? decodeURIComponent(searchParams.get('excerpt')!)
        : "";

    const visibility = searchParams.get('visibility') as 'public' | 'private' | 'organization' || 'public';
    const allowComments = searchParams.get('allowComments') === 'true';
    const allowRating = searchParams.get('allowRating') === 'true';
    const showViews = searchParams.get('showViews') === 'true';
    const allowExport = searchParams.get('allowExport') === 'true';

    // Create a mock article object matching the ArticlePopulated interface
    const mockArticle: ArticlePopulated = {
        _id: 'preview-' + Date.now(),
        title: articleTitle,
        content: editorContent,
        excerpt: excerpt,
        slug: 'preview-article',
        category: category,
        tags: tags,
        thumbnail: searchParams.get('thumbnail') || undefined,
        author: {
            _id: 'preview-user',
            name: authorName,
            email: 'preview@example.com',
            avatar: undefined
        },
        status: 'draft',
        visibility: visibility,
        publishedAt: undefined,
        views: 0,
        likes: 0,
        organization: undefined,
        allowRating: allowRating,
        allowComments: allowComments,
        showViews: showViews,
        allowExport: allowExport,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasLiked: false,
        isBookmarked: false
    };

    return <SingleArticleDetails article={mockArticle} isPreviewMode={true} />;
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