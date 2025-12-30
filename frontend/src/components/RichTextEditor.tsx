// components/RichTextEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

// Quill keyboard handler context
interface QuillKeyboardContext {
    quill: {
        format: (name: string, value: boolean | string | number) => void;
        getFormat: (range?: { index: number; length: number }) => Record<string, unknown>;
    };
}

// Quill range type
interface QuillRange {
    index: number;
    length: number;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
    ],
    keyboard: {
        bindings: {
            // Custom keyboard bindings for enhanced shortcuts
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
            },
            strike: {
                key: 'S',
                ctrlKey: true,
                shiftKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    this.quill.format('strike', !this.quill.getFormat(range).strike);
                }
            },
            // Ctrl+K for link
            link: {
                key: 'K',
                ctrlKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    const value = prompt('Enter link URL:');
                    if (value) {
                        this.quill.format('link', value);
                    }
                }
            },
            // Ctrl+Shift+7 for ordered list
            orderedList: {
                key: '7',
                ctrlKey: true,
                shiftKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    this.quill.format('list', this.quill.getFormat(range).list === 'ordered' ? false : 'ordered');
                }
            },
            // Ctrl+Shift+8 for bullet list
            bulletList: {
                key: '8',
                ctrlKey: true,
                shiftKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    this.quill.format('list', this.quill.getFormat(range).list === 'bullet' ? false : 'bullet');
                }
            },
            // Ctrl+Shift+> for blockquote
            blockquote: {
                key: '>',
                ctrlKey: true,
                shiftKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    this.quill.format('blockquote', !this.quill.getFormat(range).blockquote);
                }
            },
            // Ctrl+Alt+1/2/3 for headers
            header1: {
                key: '1',
                ctrlKey: true,
                altKey: true,
                handler: function(this: QuillKeyboardContext) {
                    this.quill.format('header', this.quill.getFormat().header === 1 ? false : 1);
                }
            },
            header2: {
                key: '2',
                ctrlKey: true,
                altKey: true,
                handler: function(this: QuillKeyboardContext) {
                    this.quill.format('header', this.quill.getFormat().header === 2 ? false : 2);
                }
            },
            header3: {
                key: '3',
                ctrlKey: true,
                altKey: true,
                handler: function(this: QuillKeyboardContext) {
                    this.quill.format('header', this.quill.getFormat().header === 3 ? false : 3);
                }
            },
            // Ctrl+Shift+C for code block
            codeBlock: {
                key: 'C',
                ctrlKey: true,
                shiftKey: true,
                handler: function(this: QuillKeyboardContext, range: QuillRange) {
                    this.quill.format('code-block', !this.quill.getFormat(range)['code-block']);
                }
            }
        }
    }
};

const formats = [
    'header', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align',
    'list', 'bullet', 'indent', 'blockquote', 'code-block',
    'link', 'image'
];

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Start typing...'
}: RichTextEditorProps) {
    const [content, setContent] = useState(value);
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Update internal state when value prop changes (e.g., when editing existing content)
    useEffect(() => {
        setContent(value);
    }, [value]);

    const handleChange = (value: string) => {
        setContent(value);
        onChange?.(value);
    };

    return (
        <div className="bg-white rounded-lg">
            {/* Keyboard shortcuts help */}
            <div className="mb-2 flex justify-end">
                <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                    {showShortcuts ? 'Hide' : 'Show'} keyboard shortcuts
                </button>
            </div>

            {showShortcuts && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2 text-blue-900">Keyboard Shortcuts:</h4>
                    <div className="grid grid-cols-2 gap-2 text-gray-700">
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+B</kbd> Bold</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+I</kbd> Italic</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+U</kbd> Underline</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+S</kbd> Strikethrough</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+K</kbd> Insert Link</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+7</kbd> Ordered List</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+8</kbd> Bullet List</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+{'>'}</kbd> Blockquote</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Alt+1/2/3</kbd> Headers</div>
                        <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+C</kbd> Code Block</div>
                    </div>
                </div>
            )}

            <ReactQuill
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: '60vh' }}
            />
        </div>
    );
}




// ### Usage Example
// // app/page.tsx
// 'use client';

// import { useState } from 'react';
// import RichTextEditor from '@/components/RichTextEditor';

// export default function HomePage() {
//   const [content, setContent] = useState('');

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Rich Text Editor</h1>
//       <RichTextEditor
//         value={content}
//         onChange={setContent}
//         placeholder="Write something amazing..."
//       />
//       <div className="mt-4">
//         <h2 className="text-lg font-semibold">Output:</h2>
//         <div dangerouslySetInnerHTML={{ __html: content }} />
//       </div>
//     </div>
//   );
// }