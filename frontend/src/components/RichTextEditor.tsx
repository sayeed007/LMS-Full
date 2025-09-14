// components/RichTextEditor.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
    ],
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
];

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Start typing...'
}: RichTextEditorProps) {
    const [content, setContent] = useState(value);

    const handleChange = (value: string) => {
        setContent(value);
        onChange?.(value);
    };

    return (
        <div className="bg-white rounded-lg">
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