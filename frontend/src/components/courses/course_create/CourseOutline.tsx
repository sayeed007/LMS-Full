"use client";

import { CourseHeaderContext } from "@/app/courses/create/[course_id]/layout";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
    CoursePopulated,
    CreateChapterRequest,
    CreateLessonRequest,
    useCreateChapterMutation,
    useCreateLessonMutation,
    useGetChaptersQuery,
    useGetLessonsQuery,
    useReorderChaptersMutation,
    useReorderLessonsMutation
} from "@/store/api/courseApi";
import {
    Edit,
    List,
    Plus,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DragDropProvider } from './DragDropProvider';
import { SortableContainer } from './SortableContainer';
import { SortableItem } from './SortableItem';
import { EmptyState } from './EmptyState';
import { CreationForm } from './CreationForm';

interface CourseOutlineProps {
    course?: CoursePopulated;
}

export default function CourseOutline({ course }: CourseOutlineProps) {
    const [lessonName, setLessonName] = useState("");
    const [chapterName, setChapterName] = useState("");
    const [createFirstLesson, setCreateFirstLesson] = useState<boolean>(false);
    const [createFirstChapter, setCreateFirstChapter] = useState<boolean>(false);
    const [isCreatingNewLesson, setIsCreatingNewLesson] = useState<boolean>(false);
    const [isCreatingNewChapter, setIsCreatingNewChapter] = useState<boolean>(false);

    const { setShowHeaderActions } = useContext(CourseHeaderContext);
    const router = useRouter();

    // API hooks
    const {
        data: lessonsData,
        isLoading: isLoadingLessons,
        error: lessonsError
    } = useGetLessonsQuery(
        { courseId: course?._id || "" },
        { skip: !course?._id }
    );

    const {
        data: chaptersData,
        isLoading: isLoadingChapters,
        error: chaptersError
    } = useGetChaptersQuery(
        { courseId: course?._id || "" },
        { skip: !course?._id }
    );

    const [createLesson, { isLoading: isCreatingLesson }] = useCreateLessonMutation();
    const [createChapter, { isLoading: isCreatingChapter }] = useCreateChapterMutation();
    const [reorderLessons, { isLoading: isReorderingLessons }] = useReorderLessonsMutation();
    const [reorderChapters, { isLoading: isReorderingChapters }] = useReorderChaptersMutation();

    const lessons = useMemo(() => {
        const lessonList = lessonsData?.data?.lessons || [];
        return [...lessonList].sort((a, b) => (a?.order || 0) - (b?.order || 0));
    }, [lessonsData?.data?.lessons]);

    const chapters = useMemo(() => {
        const chapterList = chaptersData?.data?.chapters || [];
        return [...chapterList].sort((a, b) => (a?.order || 0) - (b?.order || 0)).map(chapter => ({
            ...chapter,
            lessons: chapter.lessons ? [...chapter.lessons].sort((a, b) => (a?.order || 0) - (b?.order || 0)) : []
        }));
    }, [chaptersData?.data?.chapters]);
    const isLoading = isLoadingLessons || isLoadingChapters;
    const error = lessonsError || chaptersError;

    useEffect(() => {
        setShowHeaderActions(lessons.length > 0 || chapters.length > 0);
    }, [lessons.length, chapters.length, setShowHeaderActions]);

    const handleCreateLesson = useCallback(async (chapterId?: string) => {
        if (!course?._id || !lessonName.trim()) {
            showErrorToast("Please enter a lesson name");
            return;
        }

        try {
            const lessonData: CreateLessonRequest = {
                title: lessonName,
                description: "",
                estimatedDuration: 0,
                isPreview: false,
                isPremium: false,
                isPublished: false,
                resources: [],
                settings: {
                    allowComments: true,
                    downloadable: false,
                    autoComplete: false,
                    preventSkipping: false,
                    showTranscript: false
                },
                tags: [],
                language: 'en',
                ...(chapterId && { chapter: chapterId })
            };

            await createLesson({
                courseId: course._id,
                data: lessonData,
            }).unwrap();

            showSuccessToast("Lesson created successfully!");
            setLessonName("");
            setCreateFirstLesson(false);
            setIsCreatingNewLesson(false);
        } catch (error) {
            console.error("Error creating lesson:", error);
            showErrorToast("Failed to create lesson");
        }
    }, [course?._id, lessonName, createLesson]);

    const handleCreateChapter = useCallback(async () => {
        if (!course?._id || !chapterName.trim()) {
            showErrorToast("Please enter a chapter name");
            return;
        }

        try {
            const chapterData: CreateChapterRequest = {
                title: chapterName,
                description: "",
            };

            await createChapter({
                courseId: course._id,
                data: chapterData,
            }).unwrap();

            showSuccessToast("Chapter created successfully!");
            setChapterName("");
            setCreateFirstChapter(false);
            setIsCreatingNewChapter(false);
        } catch (error) {
            console.error("Error creating chapter:", error);
            showErrorToast("Failed to create chapter");
        }
    }, [course?._id, chapterName, createChapter]);

    // Drag and Drop handlers
    const onDragEnd = useCallback(async (event: {
        active: any;
        over: { id: string; type?: string } | null;
        sourceContainer: string;
        targetContainer: string;
        sourceIndex: number;
        targetIndex: number;
    }) => {
        const { active, over, sourceContainer, targetContainer, sourceIndex, targetIndex } = event;

        if (!over) return;
        if (sourceContainer === targetContainer && sourceIndex === targetIndex) return;
        if (!course?._id) return;

        try {
            if (active.type === 'chapter') {
                const reorderedChapters = Array.from(chapters);
                const [removed] = reorderedChapters.splice(sourceIndex, 1);
                reorderedChapters.splice(targetIndex, 0, removed);

                const reorderData = reorderedChapters.map((chapter, index) => ({
                    _id: chapter._id,
                    order: index + 1
                }));

                await reorderChapters({
                    courseId: course._id,
                    chapters: reorderData
                }).unwrap();

                showSuccessToast('Chapters reordered successfully!');
            }
        } catch (error) {
            console.error('Error reordering:', error);
            showErrorToast('Failed to reorder items');
        }
    }, [chapters, lessons, course?._id, reorderChapters, reorderLessons]);

    const startCreatingLesson = () => {
        setIsCreatingNewLesson(true);
        setIsCreatingNewChapter(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setLessonName("");
    };

    const startCreatingChapter = () => {
        setIsCreatingNewChapter(true);
        setIsCreatingNewLesson(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setChapterName("");
    };

    const cancelCreation = () => {
        setIsCreatingNewLesson(false);
        setIsCreatingNewChapter(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setLessonName("");
        setChapterName("");
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-600">Failed to load lessons</p>
            </div>
        );
    }

    // Empty state
    if (lessons.length === 0 && chapters.length === 0) {
        if (createFirstLesson) {
            return (
                <CreationForm
                    type="lesson"
                    value={lessonName}
                    onChange={setLessonName}
                    onSubmit={handleCreateLesson}
                    onCancel={cancelCreation}
                    isLoading={isCreatingLesson}
                    placeholder="Enter Lesson Name"
                />
            );
        }

        if (createFirstChapter) {
            return (
                <CreationForm
                    type="chapter"
                    value={chapterName}
                    onChange={setChapterName}
                    onSubmit={handleCreateChapter}
                    onCancel={cancelCreation}
                    isLoading={isCreatingChapter}
                    placeholder="Enter Chapter Name"
                />
            );
        }

        return (
            <EmptyState
                onCreateFirstLesson={() => setCreateFirstLesson(true)}
                onCreateFirstChapter={() => setCreateFirstChapter(true)}
            />
        );
    }

    // Main content with drag and drop
    return (
        <DragDropProvider onDragEnd={onDragEnd}>
            <div className="space-y-4">
                {/* Chapters */}
                {chapters.length > 0 && (
                    <SortableContainer
                        id="chapters"
                        items={chapters.map(ch => ch._id)}
                        type="chapter"
                    >
                        {chapters.map((chapter) => (
                            <SortableItem
                                key={chapter._id}
                                id={chapter._id}
                                type="chapter"
                                data={chapter}
                                className="mb-4"
                            >
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <List className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold text-blue-800">
                                                {chapter.title}
                                            </span>
                                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                                                Chapter
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContainer>
                )}

                {/* Standalone Lessons */}
                {lessons.filter(lesson => !lesson.chapter).length > 0 && (
                    <SortableContainer
                        id="standalone-lessons"
                        items={lessons.filter(l => !l.chapter).map(l => l._id)}
                        type="lesson"
                    >
                        {lessons.filter(lesson => !lesson.chapter).map((lesson) => (
                            <SortableItem
                                key={lesson._id}
                                id={lesson._id}
                                type="lesson"
                                data={lesson}
                                className="mb-2"
                            >
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{lesson.title}</span>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContainer>
                )}

                {/* Creation forms */}
                {isCreatingNewLesson && (
                    <CreationForm
                        type="lesson"
                        value={lessonName}
                        onChange={setLessonName}
                        onSubmit={() => handleCreateLesson()}
                        onCancel={cancelCreation}
                        isLoading={isCreatingLesson}
                        placeholder="Enter Lesson Name"
                    />
                )}

                {isCreatingNewChapter && (
                    <CreationForm
                        type="chapter"
                        value={chapterName}
                        onChange={setChapterName}
                        onSubmit={handleCreateChapter}
                        onCancel={cancelCreation}
                        isLoading={isCreatingChapter}
                        placeholder="Enter Chapter Name"
                    />
                )}

                {/* Add buttons */}
                {!isCreatingNewLesson && !isCreatingNewChapter && (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={startCreatingLesson}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                        </Button>
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={startCreatingChapter}
                        >
                            <List className="w-4 h-4 mr-2" />
                            Add Chapter
                        </Button>
                    </div>
                )}
            </div>
        </DragDropProvider>
    );
}