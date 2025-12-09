"use client";

import { Button } from "@/components/ui/button";
import { useGetContentByLessonQuery } from "@/store/api/courseApi";
import { LessonContent } from "@/types/backend-models";
import {
    ChevronsDownUp,
    ChevronsUpDown,
    Edit,
    File,
    Plus,
    Trash2
} from "lucide-react";
import { ContentItem } from "./ContentItem";

interface ContentType {
    id: string;
    type: LessonContent['type'];
    icon: string;
    label: string;
}

interface LessonItemProps {
    lesson: { _id: string; title: string; description?: string; order?: number; chapterId?: string; resources?: unknown[] };
    courseId: string;
    isInChapter?: boolean;
    expandedLessons: Set<string>;
    showContentPopup: string | null;
    editingLesson: string | null;
    editingLessonName: string;
    isDeletingLesson: boolean;
    isDeletingContent: boolean;
    isUpdatingLesson: boolean;
    onToggleLessonExpansion: (lessonId: string) => void;
    onSetShowContentPopup: (lessonId: string | null) => void;
    onStartEditingLesson: (lessonId: string, currentTitle: string) => void;
    onUpdateLesson: (lessonId: string) => void;
    onCancelEditingLesson: () => void;
    onSetEditingLessonName: (name: string) => void;
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
    editingLesson,
    editingLessonName,
    isDeletingLesson,
    isDeletingContent,
    isUpdatingLesson,
    onToggleLessonExpansion,
    onSetShowContentPopup,
    onStartEditingLesson,
    onUpdateLesson,
    onCancelEditingLesson,
    onSetEditingLessonName,
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
    console.log(isInChapter, showContentPopup, onAddContent);

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative mb-6"
            data-lesson-id={lesson._id}
        >

            <Button
                variant="outline"
                size="sm"
                onClick={() => onSetShowContentPopup(lesson._id)}
                className="text-black font-bold bg-white border-grey-1 hover:bg-off-white-1 absolute bottom-[-15px] left-[45%] rounded-2xl "
                aria-label="Add Content"
            >
                <Plus className="w-4 h-4 mr-1" />
                Add Content
            </Button>

            {/* Lesson Header */}
            <div className="p-4">
                {editingLesson === lesson._id ? (
                    /* Editing Mode */
                    <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={editingLessonName}
                            onChange={(e) => onSetEditingLessonName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Lesson name"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onUpdateLesson(lesson._id);
                                } else if (e.key === 'Escape') {
                                    onCancelEditingLesson();
                                }
                            }}
                        />
                        <Button
                            size="sm"
                            onClick={() => onUpdateLesson(lesson._id)}
                            disabled={isUpdatingLesson}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isUpdatingLesson ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancelEditingLesson}
                            disabled={isUpdatingLesson}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    /* Display Mode */
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
                        <div className="flex items-center gap-1">

                            {content.length > 0 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleLessonExpansion(lesson._id)}
                                    >
                                        {isExpanded ?
                                            <ChevronsUpDown className="w-4 h-4" />
                                            :
                                            <ChevronsDownUp className="w-4 h-4" />
                                        }
                                    </Button>
                                </>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStartEditingLesson(lesson._id, lesson.title)}
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
                )}
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


        </div >
    );
};