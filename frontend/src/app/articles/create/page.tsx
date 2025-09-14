// app/articles/create/page.tsx
import { ArticleCreationOptions } from "@/components/articles/article-creation-options"
import { Suspense } from "react"

export default function CreateArticlePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArticleCreationOptions />
        </Suspense>
    )
}