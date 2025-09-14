"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ComponentType } from 'react';
// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as ComponentType<any>;
import "react-quill-new/dist/quill.snow.css";

export default function ArticleEditorPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <input
                className="w-full text-2xl font-bold mb-6 border-b border-off-white-4 pb-2 focus:outline-info"
                placeholder="Enter article title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <div className="mb-8">
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    theme="snow"
                    className="bg-white rounded-xl min-h-[300px]"
                />
            </div>
            <div className="flex gap-4 mt-8">
                <button className="bg-info text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition">
                    Publish
                </button>
                <button className="px-8 py-2 rounded-lg border text-dark hover:bg-off-white-4">
                    Preview
                </button>
            </div>
        </div>
    );
} 