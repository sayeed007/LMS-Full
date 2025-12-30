// components/question-bank/QuestionRichTextEditor.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuillComponent = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

interface QuestionRichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    compact?: boolean; // Compact mode for questions (smaller toolbar)
}

// Quill keyboard handler context
interface QuillKeyboardContext {
    quill: {
        format: (name: string, value: boolean) => void;
        getFormat: (range?: { index: number; length: number }) => Record<string, boolean>;
    };
}

// Quill range type
interface QuillRange {
    index: number;
    length: number;
}

export default function QuestionRichTextEditor({
    value = '',
    onChange,
    placeholder = 'Type your question here...',
    compact = false
}: QuestionRichTextEditorProps) {
    const [content, setContent] = useState(value);

    // Compact toolbar for questions
    const compactModules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['formula'], // LaTeX formula support
            ['code-block'],
            ['clean']
        ],
        formula: true,
        keyboard: {
            bindings: {
                bold: {
                    key: 'B',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('bold', !this.quill.getFormat(range).bold);
                    }
                },
                italic: {
                    key: 'I',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('italic', !this.quill.getFormat(range).italic);
                    }
                },
                underline: {
                    key: 'U',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('underline', !this.quill.getFormat(range).underline);
                    }
                }
            }
        }
    }), []);

    // Full toolbar for detailed questions
    const fullModules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['formula'], // LaTeX formula support
            ['clean'],
        ],
        formula: true,
        keyboard: {
            bindings: {
                bold: {
                    key: 'B',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('bold', !this.quill.getFormat(range).bold);
                    }
                },
                italic: {
                    key: 'I',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('italic', !this.quill.getFormat(range).italic);
                    }
                },
                underline: {
                    key: 'U',
                    ctrlKey: true,
                    handler: function(this: QuillKeyboardContext, range: QuillRange) {
                        this.quill.format('underline', !this.quill.getFormat(range).underline);
                    }
                }
            }
        }
    }), []);

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'align',
        'list', 'bullet', 'indent', 'blockquote', 'code-block',
        'link', 'image', 'formula'
    ];

    // Update internal state when value prop changes
    useEffect(() => {
        setContent(value);
    }, [value]);

    const handleChange = (value: string) => {
        setContent(value);
        onChange?.(value);
    };

    // Register formula module on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('katex').then((katex) => {
                (window as Window & { katex?: unknown }).katex = katex.default;
            });
        }
    }, []);

    return (
        <div className="bg-white rounded-lg">
            <ReactQuillComponent
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={compact ? compactModules : fullModules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: compact ? '150px' : '200px' }}
            />

            {/* Math formula help */}
            <div className="mt-2 text-xs text-gray-500">
                <p>
                    <strong>Math formulas:</strong> Click the formula button (Σ) to insert LaTeX.
                    Examples: <code className="bg-gray-100 px-1 rounded">x^2</code>,
                    <code className="bg-gray-100 px-1 rounded ml-1">\frac{'{a}{b}'}</code>,
                    <code className="bg-gray-100 px-1 rounded ml-1">\sqrt{'{x}'}</code>
                </p>
            </div>
        </div>
    );
}
