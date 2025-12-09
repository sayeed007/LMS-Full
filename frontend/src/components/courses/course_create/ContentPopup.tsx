"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ContentType } from "./CourseOutline";

interface ContentPopupProps {
    showContentPopup: string | null;
    onAddContent: (lessonId: string, contentType: ContentType) => void;
    onClose: () => void;
}

const contentTypes: ContentType[] = [
    { id: 'text', type: 'text', icon: '/icons/TextAa.png', label: 'Text' },
    { id: 'block', type: 'block', icon: '/icons/Blocks.png', label: 'Block' },
    { id: 'video', type: 'video', icon: '/icons/Video.png', label: 'Video' },
    { id: 'audio', type: 'audio', icon: '/icons/Audio.png', label: 'Audio' },
    { id: 'document', type: 'document', icon: '/icons/Document.png', label: 'Document' },
    { id: 'quiz', type: 'quiz', icon: '/icons/Quiz.png', label: 'Quiz' },
    { id: 'assignment', type: 'assignment', icon: '/icons/Assignment.png', label: 'Assignment' },
];

export function ContentPopup({
    showContentPopup,
    onAddContent,
    onClose
}: ContentPopupProps) {
    if (!showContentPopup) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-10"
                onClick={onClose}
            />
            {/* Popup Content */}
            <div className="fixed inset-0 z-20 pointer-events-none">
                <div
                    id={`lesson-popup-${showContentPopup}`}
                    className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] pointer-events-auto"
                >
                    <div className="space-y-1">
                        {contentTypes.map((contentType, index) => {
                            return (
                                <button
                                    key={contentType.id}
                                    onClick={() => onAddContent(showContentPopup, contentType)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors mb-0",
                                        index !== 0 && "border-t-1 border-off-white-4"
                                    )}
                                >
                                    <Image
                                        width={20}
                                        height={20}
                                        src={contentType.icon}
                                        alt={contentType.type}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="text-sm">{contentType.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
