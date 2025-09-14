"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { dummyArticles } from "@/dummyData/articles";

const article = dummyArticles[0];

export default function ArticleDetailPage() {
    const router = useRouter();
    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <button className="mb-4 text-info hover:underline" onClick={() => router.back()}>&larr; Back to Articles</button>
            <div className="bg-white rounded-2xl shadow p-8 mb-8">
                <Image
                    src={article.thumbnail}
                    alt={article.title}
                    height={192}
                    className="h-48 w-full object-cover rounded-xl mb-6"
                />
                <div className="text-2xl font-bold text-dark mb-2">{article.title}</div>
                <div className="flex items-center gap-4 text-grey-2 text-sm mb-2">
                    <span>By {article.author.name}</span>
                    <span>•</span>
                    <span>{article.publishDate}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M1 12C1 12 5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#A0AEC0" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#A0AEC0" strokeWidth="2" /></svg>
                        {article.views}
                    </span>
                </div>
                <div className="flex gap-4 mb-6">
                    <button className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition">Export</button>
                    <Link href={`/article/${article.id}/edit`}>
                        <a className="px-6 py-2 rounded-lg border text-dark hover:bg-off-white-4">Edit Article</a>
                    </Link>
                </div>
                <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: article.content }} />
                <div className="border-t pt-6 mt-8">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-semibold text-dark">Was this article helpful?</span>
                        <button className="px-4 py-1 rounded-lg border text-dark hover:bg-off-white-4">Yes</button>
                        <button className="px-4 py-1 rounded-lg border text-dark hover:bg-off-white-4">No</button>
                    </div>
                    <div className="mb-4 font-semibold text-dark">Comments</div>
                    <textarea className="w-full border rounded-lg px-4 py-2 mb-2" placeholder="Post your comment here" rows={2} />
                    <button className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition mb-6">Post</button>
                    <div className="space-y-4">
                        <div className="bg-off-white-4 rounded-lg px-4 py-3">
                            <div className="font-semibold text-dark mb-1">James P. Chandra</div>
                            <div className="text-grey-2 text-sm mb-1">29th July, 2022 | 06:25 pm</div>
                            <div>This article is a must-read for junior developers! I especially appreciated the breakdown between SQL, NoSQL, and NewSQL.</div>
                        </div>
                        <div className="bg-off-white-4 rounded-lg px-4 py-3">
                            <div className="font-semibold text-dark mb-1">Franklin Benjamin</div>
                            <div className="text-grey-2 text-sm mb-1">28th July, 2022 | 04:25 pm</div>
                            <div>{`Great guide! Would love to see a future article covering "Best Practices for Database Security`}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 