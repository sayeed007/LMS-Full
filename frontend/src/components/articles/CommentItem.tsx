'use client';

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { ArticleAuthorInfo } from './ArticleAuthorInfo';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useLikeCommentMutation,
    useUnlikeCommentMutation,
    type Comment,
} from '@/store/api/commentApi';
import { useAppSelector } from '@/store/hooks';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { useLoginModal } from '@/hooks/useLoginModal';
import PrimaryActionButton from '../ui/PrimaryButton';
import PrimaryOutlineButton from '../ui/PrimaryOutlineButton';
import { useConfirm } from '@/hooks/useConfirm';

interface CommentItemProps {
    comment: Comment;
    articleId: string;
    onReply?: (commentId: string) => void;
    depth?: number;
}

export const CommentItem = ({ comment, articleId, onReply, depth = 0 }: CommentItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(false);

    // Calculate indentation and visual styling based on depth
    const maxVisualDepth = 5; // Support up to 5 visible levels
    const effectiveDepth = Math.min(depth, maxVisualDepth);

    // Different border colors for different depths for better visual distinction
    const borderColors = [
        'border-gray-300',    // Depth 0 (not used since depth 0 has no border)
        'border-blue-400',    // Depth 1
        'border-purple-400',  // Depth 2
        'border-green-400',   // Depth 3
        'border-orange-400',  // Depth 4
        'border-pink-400'     // Depth 5+
    ];
    const borderColor = borderColors[Math.min(depth, borderColors.length - 1)];
    const borderClass = depth > 0 ? `border-l-3 ${borderColor} pl-4 ml-6 md:ml-8` : '';
    const [localLikes, setLocalLikes] = useState(comment.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);

    const currentUser = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const { openLoginModal } = useLoginModal();
    const confirm = useConfirm();

    const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
    const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
    const [likeComment, { isLoading: isLiking }] = useLikeCommentMutation();
    const [unlikeComment, { isLoading: isUnliking }] = useUnlikeCommentMutation();

    const isAuthor = currentUser?._id === comment.author?._id;

    // Format dates
    const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const commentTime = new Date(comment.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleEdit = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false);
            return;
        }

        try {
            await updateComment({
                articleId,
                commentId: comment._id,
                data: { content: editContent.trim() }
            }).unwrap();

            showSuccessToast('Comment updated successfully');
            setIsEditing(false);
        } catch (error) {
            showErrorToast('Failed to update comment', 'Please try again');
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteComment({
                articleId,
                commentId: comment._id
            }).unwrap();

            showSuccessToast('Comment deleted successfully');
        } catch (error) {
            showErrorToast('Failed to delete comment', 'Please try again');
            console.error('Error deleting comment:', error);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            openLoginModal("Please sign in to like this comment.");
            return;
        }

        if (isLiking || isUnliking) return;

        try {
            if (hasLiked) {
                // Unlike the comment
                const result = await unlikeComment({
                    articleId,
                    commentId: comment._id
                }).unwrap();
                setHasLiked(false);
                setLocalLikes(result.data.likes);
                showSuccessToast('Comment unliked');
            } else {
                // Like the comment
                const result = await likeComment({
                    articleId,
                    commentId: comment._id
                }).unwrap();
                setHasLiked(true);
                setLocalLikes(result.data.likes);
                showSuccessToast('Comment liked');
            }
        } catch (error) {
            showErrorToast('Failed to update like', 'Please try again');
            console.error('Error toggling like:', error);
        }
    };

    const handleReply = () => {
        if (!isAuthenticated) {
            openLoginModal("Please sign in to reply to this comment.");
            return;
        }
        onReply?.(comment._id);
    };

    const handleCancelEdit = () => {
        setEditContent(comment.content);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] mb-3"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <PrimaryActionButton
                        onClick={handleEdit}
                        disabled={!editContent.trim() || isUpdating}
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </PrimaryActionButton>
                </div>
            </div>
        );
    }

    return (
        <div className={`pb-4 ${depth === 0 ? 'border-b border-gray-100' : ''}`}>
            {/* Main comment container with proper indentation and border */}
            <div className={depth > 0 ? `${borderClass} py-3` : ''}>
                <div className="flex justify-between items-start mb-2">
                    <ArticleAuthorInfo
                        authorName={comment.author?.name || "Anonymous"}
                        authorAvatar={comment.author?.avatar || ""}
                        publishDate={commentDate}
                        publishTime={commentTime}
                        comment={comment.content}
                    />

                {/* Action Menu (Edit/Delete) */}
                {isAuthor && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600"
                                disabled={isDeleting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Edit indicator */}
            {comment.isEdited && (
                <p className="text-xs text-gray-500 italic ml-12 -mt-2 mb-2">
                    Edited {comment.editedAt ? new Date(comment.editedAt).toLocaleDateString() : ''}
                </p>
            )}

            {/* Like and Reply Actions */}
            <div className="flex items-center gap-4 mt-3 ml-12">
                <PrimaryOutlineButton
                    onClick={handleLike}
                    disabled={isLiking || isUnliking}
                    className={`text-sm py-1 px-3 ${hasLiked ? 'bg-blue-50 border-blue-500' : ''}`}
                >
                    <ThumbsUp className={`w-3 h-3 mr-1 ${hasLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                    {localLikes > 0 ? localLikes : 'Like'}
                </PrimaryOutlineButton>

                <PrimaryOutlineButton
                    onClick={handleReply}
                    className="text-sm py-1 px-3"
                >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Reply
                </PrimaryOutlineButton>

                {/* Show replies count if there are replies */}
                {comment.repliesCount && comment.repliesCount > 0 && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {showReplies ? 'Hide' : 'View'} {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                    </button>
                )}
                </div>

                {/* Nested Replies */}
                {showReplies && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                articleId={articleId}
                                onReply={onReply}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
