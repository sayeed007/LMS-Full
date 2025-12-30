'use client';

import { useState, useRef } from 'react';
import '@/styles/quill-content.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import PrimaryActionButton from '../ui/PrimaryButton';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';

interface FileImporterProps {
    onImportContent: (content: string, fileName: string) => void;
    onCancel: () => void;
}

export const FileImporter = ({ onImportContent, onCancel }: FileImporterProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewContent, setPreviewContent] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptedFormats = ['.md', '.html', '.txt'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxFileSize) {
            showErrorToast('File too large', 'Please select a file smaller than 5MB');
            return;
        }

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedFormats.includes(fileExtension)) {
            showErrorToast(
                'Invalid file type',
                `Please select a file with one of these extensions: ${acceptedFormats.join(', ')}`
            );
            return;
        }

        setSelectedFile(file);
        processFile(file);
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);

        try {
            const text = await file.text();
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            let htmlContent = '';

            switch (fileExtension) {
                case '.html':
                    htmlContent = parseHTML(text);
                    break;
                case '.md':
                    htmlContent = parseMarkdown(text);
                    break;
                case '.txt':
                    htmlContent = parseText(text);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            setPreviewContent(htmlContent);
            showSuccessToast('File processed', 'Preview the content below');
        } catch (error) {
            showErrorToast('Failed to process file', 'Please try a different file');
            console.error('File processing error:', error);
            setSelectedFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const parseHTML = (html: string): string => {
        // Clean up the HTML and extract body content if present
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            return bodyMatch[1].trim();
        }
        // If no body tag, return as is (might be a fragment)
        return html.trim();
    };

    const parseMarkdown = (markdown: string): string => {
        // Basic markdown to HTML conversion
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Lists - Unordered
        html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
        html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>');

        // Lists - Ordered
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    };

    const parseText = (text: string): string => {
        // Convert plain text to HTML with paragraphs
        const paragraphs = text.split(/\n\n+/);
        return paragraphs
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('\n');
    };

    const handleImport = () => {
        if (previewContent && selectedFile) {
            onImportContent(previewContent, selectedFile.name);
            showSuccessToast('Content imported', 'You can now edit and publish your article');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewContent('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Import from File</h3>
                <p className="text-gray-600">
                    Upload a file to import its content. Supported formats: Markdown (.md), HTML (.html), Plain Text (.txt)
                </p>
            </div>

            {!selectedFile ? (
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Upload a file
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Drag and drop or click to browse
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={acceptedFormats.join(',')}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={handleBrowseClick}
                            >
                                Browse Files
                            </Button>
                            <p className="text-xs text-gray-500 mt-4">
                                {acceptedFormats.join(', ')} • Max 5MB
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <File className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {selectedFile.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    disabled={isProcessing}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {isProcessing ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Processing file...</p>
                        </div>
                    ) : previewContent ? (
                        <>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Preview Mode</p>
                                    <p>
                                        Review the imported content below. You can edit it after import.
                                        Complex formatting may need manual adjustment.
                                    </p>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">Content Preview</h4>
                                    <div className="max-h-[400px] overflow-y-auto border rounded-lg p-6 bg-white shadow-inner">
                                        <div
                                            className="quill-content"
                                            dangerouslySetInnerHTML={{ __html: previewContent }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <PrimaryActionButton
                    onClick={handleImport}
                    disabled={!previewContent || isProcessing}
                >
                    Import Content
                </PrimaryActionButton>
            </div>
        </div>
    );
};
