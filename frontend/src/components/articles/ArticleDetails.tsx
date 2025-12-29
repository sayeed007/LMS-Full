"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, MessageCircle, ThumbsUp, SortDesc } from 'lucide-react';
import { useState } from 'react';
import { GoBackRoute } from '../reports/GoBackRoute';
import PrimaryActionButton from '../ui/PrimaryButton';
import PrimaryOutlineButton from '../ui/PrimaryOutlineButton';
import { useAppSelector } from '@/store/hooks';
import { PageLayout } from '../ui';
import { ArticlePopulated, useLikeArticleMutation, useUnlikeArticleMutation } from '@/store/api/articleApi';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { useCreateCommentMutation, useGetArticleCommentsQuery } from '@/store/api/commentApi';
import { useLoginModal } from '@/hooks/useLoginModal';
import { CommentItem } from './CommentItem';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


interface SingleArticleDetailsProps {
    article: ArticlePopulated;
}

const SingleArticleDetails = ({ article }: SingleArticleDetailsProps) => {

    const [newComment, setNewComment] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'createdAt' | 'likes'>('createdAt');
    const [hasLiked, setHasLiked] = useState(false);
    const [localLikes, setLocalLikes] = useState(article.likes || 0);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const { openLoginModal } = useLoginModal();

    // API mutations and queries
    const [likeArticle, { isLoading: isLiking }] = useLikeArticleMutation();
    const [unlikeArticle, { isLoading: isUnliking }] = useUnlikeArticleMutation();
    const [createComment, { isLoading: isSubmittingComment }] = useCreateCommentMutation();

    // Fetch comments for this article with sorting
    const { data: commentsData, isLoading: isLoadingComments } = useGetArticleCommentsQuery({
        articleId: article._id,
        page: 1,
        limit: 50,
        sortBy: sortBy,
        order: 'desc'
    });

    // Use editor content if provided, otherwise use mock content
    const displayContent = article.content;
    const { category, title, author, views } = article;
    const { name, avatar } = author;

    // Get comments from API response
    const comments = commentsData?.data?.comments || [];

    // Format dates from backend data
    const articleDate = article.publishedAt || article.createdAt;
    const publishDate = articleDate ? new Date(articleDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';
    const publishTime = articleDate ? new Date(articleDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    const handleLike = async () => {
        // Check authentication first
        if (!isAuthenticated) {
            openLoginModal("Please sign in to like this article.");
            return;
        }

        if (isLiking || isUnliking) return;

        try {
            if (hasLiked) {
                // Unlike the article
                await unlikeArticle(article._id).unwrap();
                setHasLiked(false);
                setLocalLikes(prev => Math.max(0, prev - 1));
                showSuccessToast('Article unliked');
            } else {
                // Like the article
                await likeArticle(article._id).unwrap();
                setHasLiked(true);
                setLocalLikes(prev => prev + 1);
                showSuccessToast('Article liked');
            }
        } catch (error) {
            showErrorToast('Failed to update like', 'Please try again');
            console.error('Error toggling like:', error);
        }
    };

    const handleCommentSubmit = async () => {
        // Check authentication first
        if (!isAuthenticated) {
            openLoginModal("Please sign in to comment on this article.");
            return;
        }

        if (!newComment.trim()) return;

        try {
            await createComment({
                articleId: article._id,
                data: {
                    content: newComment.trim(),
                    parentComment: replyToCommentId || undefined
                }
            }).unwrap();

            showSuccessToast(replyToCommentId ? 'Reply posted successfully' : 'Comment posted successfully');
            setNewComment('');
            setReplyToCommentId(null);
        } catch (error) {
            showErrorToast('Failed to post comment', 'Please try again');
            console.error('Error posting comment:', error);
        }
    };

    const handleReply = (commentId: string) => {
        setReplyToCommentId(commentId);
        // Scroll to comment input
        document.getElementById('comment-input')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('comment-input')?.focus();
    };

    const handleCancelReply = () => {
        setReplyToCommentId(null);
        setNewComment('');
    };

    const handleExport = () => {
        try {
            // Create a printable version of the article
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showErrorToast('Export failed', 'Please allow popups for this site');
                return;
            }

            // Build HTML content for PDF export
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        h1 {
                            color: #1f2937;
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 10px;
                        }
                        .meta {
                            color: #6b7280;
                            font-size: 14px;
                            margin: 20px 0;
                        }
                        .category {
                            background: #fef2f2;
                            color: #dc2626;
                            padding: 4px 12px;
                            border-radius: 4px;
                            display: inline-block;
                            margin-bottom: 10px;
                        }
                        .content {
                            margin-top: 30px;
                        }
                        @media print {
                            body {
                                max-width: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="category">${category}</div>
                    <h1>${title}</h1>
                    <div class="meta">
                        <p><strong>Author:</strong> ${name || 'Anonymous'}</p>
                        <p><strong>Published:</strong> ${publishDate} at ${publishTime}</p>
                        <p><strong>Views:</strong> ${views}</p>
                        <p><strong>Likes:</strong> ${localLikes}</p>
                    </div>
                    <div class="content">
                        ${displayContent}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then trigger print dialog
            printWindow.onload = () => {
                printWindow.print();
            };

            showSuccessToast('Export ready', 'Use the print dialog to save as PDF');
        } catch (error) {
            showErrorToast('Export failed', 'Please try again');
            console.error('Error exporting article:', error);
        }
    };

    return (
        <PageLayout title="">
            <div className="space-y-6">
                {/* Top Bar with Back Button and Export */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer'>
                        <GoBackRoute />
                        <span className="text-sm font-medium">Back to Articles</span>
                    </div>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF
                    </Button>
                </div>

                {/* Main Content Card */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-8">
                        {/* Article Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant="secondary" className="bg-red-100 text-red-800 font-medium">
                                    {category}
                                </Badge>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                {title}
                            </h1>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                        {name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{name || "Anonymous"}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span>{publishDate}</span>
                                <span className="text-gray-400">•</span>
                                <span>{views} views</span>
                            </div>
                        </div>


                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none mb-12">
                            <div
                                dangerouslySetInnerHTML={{ __html: displayContent }}
                                className="text-gray-700 leading-relaxed"
                            />
                        </div>

                        {/* Like Section */}
                        <div className="border-t border-off-white-4 pt-8 mb-8">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 font-bold">Was this article helpful?</span>

                                <PrimaryOutlineButton
                                    onClick={handleLike}
                                    className={hasLiked ? 'bg-blue-50 border-blue-500' : ''}
                                >
                                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                                    Like ({localLikes})
                                </PrimaryOutlineButton>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="border-t border-off-white-4 pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Comments ({comments.length})
                                    </h3>
                                </div>

                                {/* Sort dropdown */}
                                <div className="flex items-center gap-2">
                                    <SortDesc className="w-4 h-4 text-gray-500" />
                                    <Select value={sortBy} onValueChange={(value: 'createdAt' | 'likes') => setSortBy(value)}>
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="createdAt">Newest First</SelectItem>
                                            <SelectItem value="likes">Most Liked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Comment Input */}
                            <div className="mb-8">
                                {replyToCommentId && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                                        <span className="text-sm text-blue-700">Replying to a comment...</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelReply}
                                            className="text-blue-700 hover:text-blue-900"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                                <Textarea
                                    id="comment-input"
                                    placeholder={isAuthenticated ? (replyToCommentId ? "Write your reply here" : "Post your comment here") : "Sign in to post a comment"}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onFocus={() => {
                                        if (!isAuthenticated) {
                                            openLoginModal("Please sign in to comment on this article.");
                                        }
                                    }}
                                    className="min-h-[100px] mb-4"
                                />
                                <div className="flex justify-end">
                                    <PrimaryActionButton
                                        onClick={handleCommentSubmit}
                                        disabled={!newComment.trim() || isSubmittingComment}>
                                        {isSubmittingComment ? 'Posting...' : (replyToCommentId ? 'Post Reply' : 'Post')}
                                    </PrimaryActionButton>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {isLoadingComments ? (
                                    <div className="text-center py-8 text-gray-500">Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No comments yet. Be the first to comment!
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <CommentItem
                                            key={comment._id}
                                            comment={comment}
                                            articleId={article._id}
                                            onReply={handleReply}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default SingleArticleDetails;
