"use client";

import { Button } from "@/components/ui/button";
import { LessonContent } from "@/types/backend-models";
import {
    Edit,
    Trash2
} from "lucide-react";
import Image from "next/image";
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
            case 'text': return { ContentIcon: '/icons/TextAa.png', ContentIconName: 'TextAa' };
            case 'block': return { ContentIcon: '/icons/Blocks.png', ContentIconName: 'Blocks' };
            case 'video': return { ContentIcon: '/icons/Video.png', ContentIconName: 'Video' };
            case 'audio': return { ContentIcon: '/icons/Audio.png', ContentIconName: 'Audio' };
            case 'document': return { ContentIcon: '/icons/Document.png', ContentIconName: 'Document' };
            case 'quiz': return { ContentIcon: '/icons/Quiz.png', ContentIconName: 'Quiz' };
            case 'assignment': return { ContentIcon: '/icons/Assignment.png', ContentIconName: 'Assignment' };
            default: return { ContentIcon: '/icons/Document.png', ContentIconName: 'Document' };
        }
    };

    const { ContentIcon, ContentIconName } = getContentIcon(content.type);
    console.log(ContentIcon, ContentIconName);

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-3 ml-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        width={20}
                        height={20}
                        src={ContentIcon}
                        alt={ContentIconName}
                        className="w-5 h-5 text-gray-500"
                    />
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