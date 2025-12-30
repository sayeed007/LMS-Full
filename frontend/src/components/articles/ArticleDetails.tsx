"use client"
import '@/styles/quill-content.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, MessageCircle, ThumbsUp, SortDesc, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { GoBackRoute } from '../reports/GoBackRoute';
import PrimaryActionButton from '../ui/PrimaryButton';
import PrimaryOutlineButton from '../ui/PrimaryOutlineButton';
import { useAppSelector } from '@/store/hooks';
import { PageLayout } from '../ui';
import { ArticlePopulated, useLikeArticleMutation, useUnlikeArticleMutation, useBookmarkArticleMutation, useUnbookmarkArticleMutation } from '@/store/api/articleApi';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { useCreateCommentMutation, useGetArticleCommentsQuery } from '@/store/api/commentApi';
import { useLoginModal } from '@/hooks/useLoginModal';
import { CommentItem } from './CommentItem';
import { SocialShare } from './SocialShare';
import { decodeHTMLEntities } from '@/lib/html-utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


interface SingleArticleDetailsProps {
    article: ArticlePopulated;
    isPreviewMode?: boolean;
}

const SingleArticleDetails = ({ article, isPreviewMode = false }: SingleArticleDetailsProps) => {

    const [newComment, setNewComment] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'createdAt' | 'likes'>('createdAt');
    const [hasLiked, setHasLiked] = useState(article.hasLiked || false);
    const [localLikes, setLocalLikes] = useState(article.likes || 0);
    const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const { openLoginModal } = useLoginModal();

    // API mutations and queries
    const [likeArticle, { isLoading: isLiking }] = useLikeArticleMutation();
    const [unlikeArticle, { isLoading: isUnliking }] = useUnlikeArticleMutation();
    const [createComment, { isLoading: isSubmittingComment }] = useCreateCommentMutation();
    const [bookmarkArticle, { isLoading: isBookmarking }] = useBookmarkArticleMutation();
    const [unbookmarkArticle, { isLoading: isUnbookmarking }] = useUnbookmarkArticleMutation();

    // Fetch comments for this article with sorting (skip in preview mode)
    const { data: commentsData, isLoading: isLoadingComments } = useGetArticleCommentsQuery({
        articleId: article._id,
        page: 1,
        limit: 50,
        sortBy: sortBy,
        order: 'desc'
    }, {
        skip: isPreviewMode
    });

    // Use editor content if provided, otherwise use mock content
    // Decode HTML entities to properly render HTML content
    const displayContent = article.content ? decodeHTMLEntities(article.content) : '';
    const { category, title, author, views } = article;
    const name = author?.name || "Anonymous";

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
        // Preview mode - just toggle locally
        if (isPreviewMode) {
            if (hasLiked) {
                setHasLiked(false);
                setLocalLikes(prev => Math.max(0, prev - 1));
                showSuccessToast('Preview mode', 'Likes are not saved in preview mode');
            } else {
                setHasLiked(true);
                setLocalLikes(prev => prev + 1);
                showSuccessToast('Preview mode', 'Likes are not saved in preview mode');
            }
            return;
        }

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
        // Preview mode - show message
        if (isPreviewMode) {
            showSuccessToast('Preview mode', 'Comments are not saved in preview mode');
            setNewComment('');
            setReplyToCommentId(null);
            return;
        }

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

    const handleBookmark = async () => {
        // Preview mode - show message
        if (isPreviewMode) {
            showSuccessToast('Preview mode', 'Bookmarks are not saved in preview mode');
            setIsBookmarked(!isBookmarked);
            return;
        }

        // Check authentication first
        if (!isAuthenticated) {
            openLoginModal("Please sign in to bookmark this article.");
            return;
        }

        if (isBookmarking || isUnbookmarking) return;

        try {
            if (isBookmarked) {
                // Remove bookmark
                await unbookmarkArticle(article._id).unwrap();
                setIsBookmarked(false);
                showSuccessToast('Bookmark removed');
            } else {
                // Add bookmark
                await bookmarkArticle(article._id).unwrap();
                setIsBookmarked(true);
                showSuccessToast('Article bookmarked');
            }
        } catch (error) {
            showErrorToast('Failed to update bookmark', 'Please try again');
            console.error('Error toggling bookmark:', error);
        }
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
                {/* Preview Mode Banner */}
                {isPreviewMode && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong className="font-medium">Preview Mode:</strong> This is a preview. Actions like likes, comments, and bookmarks are not saved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Bar with Back Button and Export */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer'>
                        <GoBackRoute />
                        <span className="text-sm font-medium">{isPreviewMode ? 'Back to Editor' : 'Back to Articles'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={handleBookmark}
                        >
                            <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </Button>

                        {article.allowExport !== false && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                onClick={handleExport}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export as PDF
                            </Button>
                        )}
                    </div>
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

                        {/* Tags Section */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="mb-12">
                            <div
                                dangerouslySetInnerHTML={{ __html: displayContent }}
                                className="quill-content"
                            />
                        </div>

                        {/* Like Section */}
                        {article.allowRating !== false && (
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
                        )}

                        {/* Social Share Section */}
                        <div className="border-t border-off-white-4 pt-8 mb-8">
                            <SocialShare article={{ _id: article._id, title, excerpt: article.excerpt }} />
                        </div>

                        {/* Comments Section */}
                        {article.allowComments !== false && (
                            <div className="border-t border-off-white-4 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Comments ({comments.length})
                                        </h3>
                                    </div>

                                    {/* Sort dropdown */}
                                    {comments.length > 0 && (
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
                                    )}
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default SingleArticleDetails;
