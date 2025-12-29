"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, MessageCircle, ThumbsUp } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { GoBackRoute } from '../reports/GoBackRoute';
import PrimaryActionButton from '../ui/PrimaryButton';
import PrimaryOutlineButton from '../ui/PrimaryOutlineButton';
import { ArticleAuthorInfo } from './ArticleAuthorInfo';
import { PageLayout } from '../ui';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';

interface ArticlePreviewPageProps {
    editorContent?: string;
    articleTitle?: string;
    authorName?: string;
    category?: string;
}

const ArticlePreviewPage = ({
    editorContent = '',
    articleTitle = '',
    authorName = '',
    category = '',
}: ArticlePreviewPageProps) => {
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);

    // Use editor content if provided
    const displayContent = editorContent;

    // Format current date/time for preview
    const publishDate = moment().format('MMMM D, YYYY');
    const publishTime = moment().format('hh:mm A');

    const handleLike = () => {
        if (hasLiked) {
            setHasLiked(false);
            setLocalLikes(prev => Math.max(0, prev - 1));
        } else {
            setHasLiked(true);
            setLocalLikes(prev => prev + 1);
        }
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim()) return;

        showSuccessToast('Preview mode', 'Comments are not saved in preview mode');
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
                    <title>${articleTitle}</title>
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
                    <h1>${articleTitle}</h1>
                    <div class="meta">
                        <p><strong>Author:</strong> ${authorName || 'Anonymous'}</p>
                        <p><strong>Preview Date:</strong> ${publishDate} at ${publishTime}</p>
                        <p><strong>Status:</strong> Preview Mode</p>
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
                        <span className="text-sm font-medium">Back to Editor</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Preview Mode
                        </Badge>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export as PDF
                        </Button>
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
                                {articleTitle}
                            </h1>

                            <ArticleAuthorInfo
                                authorName={authorName || "Anonymous"}
                                authorAvatar=""
                                publishDate={publishDate}
                                publishTime={publishTime}
                                views={0}
                            />
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
                            <div className="flex items-center gap-2 mb-6">
                                <MessageCircle className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Preview Only
                                </Badge>
                            </div>

                            {/* Comment Input */}
                            <div className="mb-8">
                                <Textarea
                                    placeholder="Comments are disabled in preview mode"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[100px] mb-4"
                                />
                                <div className="flex justify-end">
                                    <PrimaryActionButton
                                        onClick={handleCommentSubmit}
                                        disabled={!newComment.trim()}>
                                        Post (Preview)
                                    </PrimaryActionButton>
                                </div>
                            </div>

                            {/* Preview Notice */}
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="font-medium">Preview Mode</p>
                                <p className="text-sm mt-1">Publish the article to enable comments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default ArticlePreviewPage;
