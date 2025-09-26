"use client";

import { Button } from "@/components/ui/button";
import { LessonContent } from "@/types/backend-models";
import {
    Clipboard,
    Edit,
    File,
    FileText,
    Grid3X3,
    HelpCircle,
    Trash2,
    Video
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ContentItemProps {
    content: LessonContent;
    lessonId: string;
    courseId: string;
    isDeletingContent: boolean;
    onDeleteContent: (lessonId: string, contentId: string) => void;
}

export const ContentItem = ({ content, lessonId, courseId, isDeletingContent, onDeleteContent }: ContentItemProps) => {
    const router = useRouter();

    const getContentIcon = (type: LessonContent['type']) => {
        switch (type) {
            case 'text': return FileText;
            case 'block': return Grid3X3;
            case 'video': return Video;
            case 'audio': return Video;
            case 'document': return File;
            case 'quiz': return HelpCircle;
            case 'assignment': return Clipboard;
            default: return File;
        }
    };

    const ContentIcon = getContentIcon(content.type);

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-3 ml-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ContentIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{content.title}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded capitalize">
                        {content.type}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/courses/create/${courseId}/courseOutline/${lessonId}/content/${content._id}/edit`)}
                        className="text-gray-600 hover:text-blue-600 p-1 h-auto"
                    >
                        <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteContent(lessonId, content._id)}
                        disabled={isDeletingContent}
                        className="text-gray-600 hover:text-red-600 p-1 h-auto"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};