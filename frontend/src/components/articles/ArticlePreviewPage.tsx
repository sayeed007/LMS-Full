"use client"
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { GoBackRoute } from '../reports/GoBackRoute';
import PrimaryActionButton from '../ui/PrimaryButton';
import PrimaryOutlineButton from '../ui/PrimaryOutlineButton';
import { ArticleAuthorInfo } from './ArticleAuthorInfo';

const ArticlePreviewPage = ({
    editorContent = '',
    articleTitle = '',
    authorName = '',
    category = '',
}) => {
    const [newComment, setNewComment] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const [voteType, setVoteType] = useState<'yes' | 'no' | null>(null);
    const [localVotes, setLocalVotes] = useState({ yes: 0, no: 0 });
    console.info(voteType)

    // Use editor content if provided, otherwise use mock content
    const displayContent = editorContent;

    const handleVote = (type: 'yes' | 'no') => {
        if (hasVoted) return;

        setHasVoted(true);
        setVoteType(type);

        if (type === 'yes') {
            setLocalVotes(prev => ({ ...prev, yes: prev.yes + 1 }));
        } else {
            setLocalVotes(prev => ({ ...prev, no: prev.no + 1 }));
        }
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim()) return;

        // Here you would typically submit to your API
        console.log('Submitting comment:', newComment);
        setNewComment('');
    };

    return (
        <div className="min-h-screen bg-gray-50 mb-8">

            {/* Main Content */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-8">
                    <div className='flex'>
                        {/* Left Back Button */}
                        <div className='flex flex-1 items-start gap-2'>
                            <GoBackRoute />
                            <span>Back</span>
                        </div>

                        {/* Middle - Main Content */}
                        <div className='flex flex-col flex-6'>
                            {/* Article Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge variant="secondary" className="bg-red-100 text-red-800 font-medium">
                                            {category}
                                        </Badge>
                                    </div>

                                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                        {articleTitle}
                                    </h1>

                                    <ArticleAuthorInfo
                                        authorName={authorName}
                                        authorAvatar={''}
                                        publishDate={moment().format('YYYY-MM-DD')}
                                        publishTime={moment().format('HH:mm:ss')}
                                    // views={views}
                                    />
                                </div>
                            </div>


                            {/* Article Content */}
                            <div className="prose prose-lg max-w-none mb-12">
                                <div
                                    dangerouslySetInnerHTML={{ __html: displayContent }}
                                    className="text-gray-700 leading-relaxed"
                                />
                            </div>

                            {/* Voting Section */}
                            <div className="border-t border-off-white-4 pt-8 mb-8">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 font-bold">Was this article helpful?</span>

                                    <div className="flex items-center gap-2">
                                        <PrimaryOutlineButton
                                            onClick={() => { handleVote('yes') }}>
                                            <ThumbsUp className="w-4 h-4" />
                                            Yes
                                        </PrimaryOutlineButton>

                                        <PrimaryOutlineButton
                                            onClick={() => { handleVote('no') }}>
                                            <ThumbsDown className="w-4 h-4" />
                                            No
                                        </PrimaryOutlineButton>
                                    </div>

                                    <div className="ml-auto text-sm text-gray-500">
                                        {localVotes.yes} Yes | {localVotes.no} No
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="border-t border-off-white-4 pt-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageCircle className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                                </div>

                                {/* Comment Input */}
                                <div className="mb-8">
                                    <Textarea
                                        placeholder="Post your comment here"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="min-h-[100px] mb-4"
                                    />
                                    <div className="flex justify-end">
                                        <PrimaryActionButton
                                            onClick={handleCommentSubmit}
                                            disabled={!newComment.trim()}>
                                            Post
                                        </PrimaryActionButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Just design */}
                        <div className='flex flex-1 items-start gap-2'></div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
};

export default ArticlePreviewPage;