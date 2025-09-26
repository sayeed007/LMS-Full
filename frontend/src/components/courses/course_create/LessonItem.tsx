"use client";

import { Button } from "@/components/ui/button";
import { useGetContentByLessonQuery } from "@/store/api/courseApi";
import { LessonContent } from "@/types/backend-models";
import {
    Edit,
    File,
    GripVertical,
    Plus,
    Trash2
} from "lucide-react";
import { ContentItem } from "./ContentItem";

interface ContentType {
    id: string;
    type: LessonContent['type'];
    icon: any;
    label: string;
}

interface LessonItemProps {
    lesson: any;
    courseId: string;
    isInChapter?: boolean;
    expandedLessons: Set<string>;
    showContentPopup: string | null;
    contentTypes: ContentType[];
    isDeletingLesson: boolean;
    isDeletingContent: boolean;
    onToggleLessonExpansion: (lessonId: string) => void;
    onSetShowContentPopup: (lessonId: string | null) => void;
    onSetEditingLesson: (lessonId: string) => void;
    onDeleteLesson: (lessonId: string) => void;
    onAddContent: (lessonId: string, contentType: ContentType) => void;
    onDeleteContent: (lessonId: string, contentId: string) => void;
}

export const LessonItem = ({
    lesson,
    courseId,
    isInChapter = false,
    expandedLessons,
    showContentPopup,
    contentTypes,
    isDeletingLesson,
    isDeletingContent,
    onToggleLessonExpansion,
    onSetShowContentPopup,
    onSetEditingLesson,
    onDeleteLesson,
    onAddContent,
    onDeleteContent
}: LessonItemProps) => {
    const isExpanded = expandedLessons.has(lesson._id);

    // Query lesson content
    const { data: contentData } = useGetContentByLessonQuery(
        { courseId: courseId || "", lessonId: lesson._id },
        { skip: !courseId || !lesson._id }
    );

    const content = contentData?.data?.content || [];

    return (
        <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative">
            {/* Lesson Header */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{lesson.title}</span>
                            {content.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                    {content.length} content item{content.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSetShowContentPopup(lesson._id)}
                            className="text-black border-gray-300 hover:bg-gray-50"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Content
                        </Button>
                        {content.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleLessonExpansion(lesson._id)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSetEditingLesson(lesson._id)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteLesson(lesson._id)}
                            disabled={isDeletingLesson}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content List */}
            {isExpanded && content.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                    {content.map((contentItem) => (
                        <ContentItem
                            key={contentItem._id}
                            content={contentItem}
                            lessonId={lesson._id}
                            courseId={courseId}
                            isDeletingContent={isDeletingContent}
                            onDeleteContent={onDeleteContent}
                        />
                    ))}
                </div>
            )}

            {/* Content Popup */}
            {showContentPopup === lesson._id && (
                <div className="absolute top-full right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                    <div className="space-y-1">
                        {contentTypes.map((contentType) => {
                            const IconComponent = contentType.icon;
                            return (
                                <button
                                    key={contentType.id}
                                    onClick={() => onAddContent(lesson._id, contentType)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    <IconComponent className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">{contentType.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};