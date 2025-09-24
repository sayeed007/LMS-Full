"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Eye } from 'lucide-react';

interface TextContentEditorProps {
    data: { text?: string };
    onChange: (data: any) => void;
}

export default function TextContentEditor({ data, onChange }: TextContentEditorProps) {
    const [text, setText] = useState(data?.text || '');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setText(data?.text || '');
    }, [data?.text]);

    const handleTextChange = (value: string) => {
        setText(value);
        onChange({ text: value });
    };

    const insertFormatting = (format: string) => {
        const textarea = document.getElementById('text-content') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);

        let formattedText = '';
        let cursorOffset = 0;

        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'list':
                formattedText = `\n- ${selectedText}`;
                cursorOffset = selectedText ? 0 : 0;
                break;
            case 'numbered':
                formattedText = `\n1. ${selectedText}`;
                cursorOffset = selectedText ? 0 : 0;
                break;
        }

        const newText = text.substring(0, start) + formattedText + text.substring(end);
        handleTextChange(newText);

        // Set cursor position after formatting
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + formattedText.length - cursorOffset;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const renderPreview = () => {
        // Simple markdown-like preview rendering
        let preview = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
            .replace(/\n/g, '<br>');

        // Wrap list items
        preview = preview.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        return (
            <div
                className="prose max-w-none p-4 bg-gray-50 rounded-md border"
                dangerouslySetInnerHTML={{ __html: preview }}
            />
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Text Content</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('bold')}
                            className="px-2 py-1"
                        >
                            <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('italic')}
                            className="px-2 py-1"
                        >
                            <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('list')}
                            className="px-2 py-1"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('numbered')}
                            className="px-2 py-1"
                        >
                            <ListOrdered className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {showPreview ? (
                    renderPreview()
                ) : (
                    <Textarea
                        id="text-content"
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Enter your text content here... You can use **bold**, *italic*, and lists."
                        className="min-h-[400px] font-mono"
                    />
                )}
            </div>

            <div className="text-sm text-gray-500">
                <p>Formatting tips:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><code>**bold**</code> for <strong>bold text</strong></li>
                    <li><code>*italic*</code> for <em>italic text</em></li>
                    <li><code>- item</code> for bullet lists</li>
                    <li><code>1. item</code> for numbered lists</li>
                </ul>
            </div>
        </div>
    );
}