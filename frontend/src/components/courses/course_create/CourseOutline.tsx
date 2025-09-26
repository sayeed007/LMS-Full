"use client";

import { CourseHeaderContext } from "@/app/courses/create/[course_id]/layout";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
    CoursePopulated,
    CreateChapterRequest,
    CreateLessonRequest,
    useCreateChapterMutation,
    useCreateContentMutation,
    useCreateLessonMutation,
    useDeleteChapterMutation,
    useDeleteContentMutation,
    useDeleteLessonMutation,
    useGetChaptersQuery,
    useGetLessonsQuery,
    useReorderChaptersMutation,
    useReorderLessonsMutation
} from "@/store/api/courseApi";
import { LessonContent } from "@/types/backend-models";
import {
    Clipboard,
    Edit,
    File,
    FileText,
    Grid3X3,
    HelpCircle,
    List,
    Plus,
    Trash2,
    Video
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DragDropProvider } from './DragDropProvider';
import { SortableContainer } from './SortableContainer';
import { SortableItem } from './SortableItem';
import { EmptyState } from './EmptyState';
import { CreationForm } from './CreationForm';
import { LessonItem } from './LessonItem';

interface CourseOutlineProps {
    course?: CoursePopulated;
}

interface ContentType {
    id: string;
    type: LessonContent['type'];
    icon: any;
    label: string;
}

const contentTypes: ContentType[] = [
    { id: 'text', type: 'text', icon: FileText, label: 'Text' },
    { id: 'block', type: 'block', icon: Grid3X3, label: 'Block' },
    { id: 'video', type: 'video', icon: Video, label: 'Video' },
    { id: 'audio', type: 'audio', icon: Video, label: 'Audio' },
    { id: 'document', type: 'document', icon: File, label: 'Document' },
    { id: 'quiz', type: 'quiz', icon: HelpCircle, label: 'Quiz' },
    { id: 'assignment', type: 'assignment', icon: Clipboard, label: 'Assignment' },
];

export default function CourseOutline({ course }: CourseOutlineProps) {
    const [lessonName, setLessonName] = useState("");
    const [chapterName, setChapterName] = useState("");
    const [createFirstLesson, setCreateFirstLesson] = useState<boolean>(false);
    const [createFirstChapter, setCreateFirstChapter] = useState<boolean>(false);
    const [isCreatingNewLesson, setIsCreatingNewLesson] = useState<boolean>(false);
    const [isCreatingNewChapter, setIsCreatingNewChapter] = useState<boolean>(false);
    // Additional state for nested content
    const [showContentPopup, setShowContentPopup] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<string | null>(null);
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
    const [creatingLessonInChapter, setCreatingLessonInChapter] = useState<string | null>(null);

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
    const [deleteLesson, { isLoading: isDeletingLesson }] = useDeleteLessonMutation();
    const [createChapter, { isLoading: isCreatingChapter }] = useCreateChapterMutation();
    const [deleteChapter, { isLoading: isDeletingChapter }] = useDeleteChapterMutation();
    const [createContent, { isLoading: isCreatingContent }] = useCreateContentMutation();
    const [deleteContent, { isLoading: isDeletingContent }] = useDeleteContentMutation();
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

    const handleDeleteLesson = async (lessonId: string) => {
        if (!course?._id) return;

        try {
            await deleteLesson({
                courseId: course._id,
                lessonId,
            }).unwrap();
            showSuccessToast("Lesson deleted successfully!");
        } catch (error) {
            console.error("Error deleting lesson:", error);
            showErrorToast("Failed to delete lesson");
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!course?._id) return;

        try {
            await deleteChapter({
                courseId: course._id,
                chapterId,
            }).unwrap();
            showSuccessToast("Chapter deleted successfully!");
        } catch (error) {
            console.error("Error deleting chapter:", error);
            showErrorToast("Failed to delete chapter");
        }
    };

    const handleAddContent = async (lessonId: string, contentType: ContentType) => {
        setShowContentPopup(null);

        if (!course?._id) return;

        try {
            const baseData = {
                title: `New ${contentType.label}`,
                description: '',
                type: contentType.type,
                data: getDefaultContentData(contentType.type),
                isPublished: false,
                isPreview: false,
                objectives: [],
                tags: []
            };

            const result = await createContent({
                courseId: course._id,
                lessonId,
                data: baseData
            }).unwrap();

            showSuccessToast(`${contentType.label} content added successfully!`);

            router.push(`/courses/create/${course._id}/courseOutline/${lessonId}/content/${result?.data?.content._id}/edit`);
        } catch (error) {
            console.error(`Error creating ${contentType.label} content:`, error);
            showErrorToast(`Failed to create ${contentType.label} content`);
        }
    };

    const getDefaultContentData = (type: LessonContent['type']) => {
        switch (type) {
            case 'text':
                return { text: 'Enter your text content here...' };
            case 'block':
                return { items: [] };
            case 'audio':
            case 'video':
            case 'document':
                return { url: '', filename: '', size: 0, mimeType: '' };
            case 'quiz':
                return {
                    quiz: {
                        instructions: '',
                        timeLimit: 0,
                        attempts: 1,
                        shuffleQuestions: false,
                        showFeedback: true,
                        passingScore: 70,
                        questions: []
                    }
                };
            case 'assignment':
                return {
                    assignment: {
                        title: '',
                        description: '',
                        submissionType: 'file' as const,
                        maxFileSize: 10 * 1024 * 1024,
                        maxSubmissions: 1,
                        maxPoints: 100,
                        autoGrade: false,
                        allowLateSubmission: false,
                        lateSubmissionPenalty: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                };
            default:
                return {};
        }
    };

    const handleDeleteContent = async (lessonId: string, contentId: string) => {
        if (!course?._id) return;

        try {
            await deleteContent({
                courseId: course._id,
                lessonId,
                contentId
            }).unwrap();
            showSuccessToast("Content deleted successfully!");
        } catch (error) {
            console.error("Error deleting content:", error);
            showErrorToast("Failed to delete content");
        }
    };

    const toggleLessonExpansion = (lessonId: string) => {
        setExpandedLessons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lessonId)) {
                newSet.delete(lessonId);
            } else {
                newSet.add(lessonId);
            }
            return newSet;
        });
    };

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

        console.log('onDragEnd event:', {
            active: active,
            over: over,
            sourceContainer,
            targetContainer,
            sourceIndex,
            targetIndex,
            courseId: course?._id
        });

        if (!over) {
            console.log('onDragEnd: No over target');
            return;
        }
        if (sourceContainer === targetContainer && sourceIndex === targetIndex) {
            console.log('onDragEnd: Same position, no change needed');
            return;
        }
        if (!course?._id) {
            console.log('onDragEnd: No course ID');
            return;
        }

        try {
            if (active.type === 'chapter') {
                console.log('Reordering chapters...');
                const reorderedChapters = Array.from(chapters);
                const [removed] = reorderedChapters.splice(sourceIndex, 1);
                reorderedChapters.splice(targetIndex, 0, removed);

                const reorderData = reorderedChapters.map((chapter, index) => ({
                    _id: chapter._id,
                    order: index + 1
                }));

                console.log('Chapter reorder data:', reorderData);

                await reorderChapters({
                    courseId: course._id,
                    chapters: reorderData
                }).unwrap();

                showSuccessToast('Chapters reordered successfully!');
                console.log('Chapters reordered successfully');
            } else if (active.type === 'lesson') {
                console.log('Reordering lessons...');
                // Handle lesson reordering
                if (sourceContainer.startsWith('chapter-') && targetContainer.startsWith('chapter-')) {
                    // Moving lessons within or between chapters
                    const sourceChapterId = sourceContainer.replace('chapter-', '').replace('-lessons', '');
                    const destChapterId = targetContainer.replace('chapter-', '').replace('-lessons', '');

                    console.log('Chapter lesson reorder:', { sourceChapterId, destChapterId });

                    if (sourceChapterId === destChapterId) {
                        // Reordering within same chapter
                        const sourceChapter = chapters.find(ch => ch._id === sourceChapterId);
                        if (sourceChapter?.lessons) {
                            console.log('Found source chapter with lessons:', sourceChapter.lessons.length);
                            const reorderedLessons = Array.from(sourceChapter.lessons);
                            const [removed] = reorderedLessons.splice(sourceIndex, 1);
                            reorderedLessons.splice(targetIndex, 0, removed);

                            const reorderData = reorderedLessons.map((lesson, index) => ({
                                _id: lesson._id,
                                order: index + 1
                            }));

                            console.log('Chapter lesson reorder data:', reorderData);

                            await reorderLessons({
                                courseId: course._id,
                                lessons: reorderData
                            }).unwrap();

                            showSuccessToast('Lessons reordered successfully!');
                            console.log('Chapter lessons reordered successfully');
                        }
                    }
                } else if (sourceContainer === 'standalone-lessons' && targetContainer === 'standalone-lessons') {
                    // Reordering standalone lessons
                    console.log('Reordering standalone lessons');
                    const standaloneLessons = lessons.filter(lesson => !lesson.chapter);
                    console.log('Standalone lessons count:', standaloneLessons.length);
                    const reorderedLessons = Array.from(standaloneLessons);
                    const [removed] = reorderedLessons.splice(sourceIndex, 1);
                    reorderedLessons.splice(targetIndex, 0, removed);

                    const reorderData = reorderedLessons.map((lesson, index) => ({
                        _id: lesson._id,
                        order: index + 1
                    }));

                    console.log('Standalone lesson reorder data:', reorderData);

                    await reorderLessons({
                        courseId: course._id,
                        lessons: reorderData
                    }).unwrap();

                    showSuccessToast('Lessons reordered successfully!');
                    console.log('Standalone lessons reordered successfully');
                }
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
        setCreatingLessonInChapter(null);
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
                                <div className="space-y-2">
                                    {/* Chapter Header */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <List className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-blue-800">
                                                    {chapter.title}
                                                </span>
                                                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                                                    Chapter {chapter.lessons?.length ? `(${chapter.lessons.length} lessons)` : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCreatingLessonInChapter(chapter._id)}
                                                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Add Lesson
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteChapter(chapter._id)}
                                                    disabled={isDeletingChapter}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Lesson Form for this chapter */}
                                    {creatingLessonInChapter === chapter._id && (
                                        <div className="ml-6 mt-2">
                                            <CreationForm
                                                type="lesson"
                                                value={lessonName}
                                                onChange={setLessonName}
                                                onSubmit={() => handleCreateLesson(chapter._id)}
                                                onCancel={() => setCreatingLessonInChapter(null)}
                                                isLoading={isCreatingLesson}
                                                placeholder="Enter Lesson Name"
                                                className="border-blue-200"
                                            />
                                        </div>
                                    )}

                                    {/* Chapter Lessons */}
                                    {chapter.lessons && chapter.lessons.length > 0 && (
                                        <SortableContainer
                                            id={`chapter-${chapter._id}-lessons`}
                                            items={chapter.lessons.map(l => l._id)}
                                            type="lesson"
                                            className="ml-6 space-y-2"
                                        >
                                            {chapter.lessons.map((lesson) => (
                                                <SortableItem
                                                    key={lesson._id}
                                                    id={lesson._id}
                                                    type="lesson"
                                                    data={lesson}
                                                >
                                                    <LessonItem
                                                        lesson={lesson}
                                                        courseId={course?._id || ""}
                                                        isInChapter={true}
                                                        expandedLessons={expandedLessons}
                                                        showContentPopup={showContentPopup}
                                                        contentTypes={contentTypes}
                                                        isDeletingLesson={isDeletingLesson}
                                                        isDeletingContent={isDeletingContent}
                                                        onToggleLessonExpansion={toggleLessonExpansion}
                                                        onSetShowContentPopup={setShowContentPopup}
                                                        onSetEditingLesson={setEditingLesson}
                                                        onDeleteLesson={handleDeleteLesson}
                                                        onAddContent={handleAddContent}
                                                        onDeleteContent={handleDeleteContent}
                                                    />
                                                </SortableItem>
                                            ))}
                                        </SortableContainer>
                                    )}
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
                                <LessonItem
                                    lesson={lesson}
                                    courseId={course?._id || ""}
                                    isInChapter={false}
                                    expandedLessons={expandedLessons}
                                    showContentPopup={showContentPopup}
                                    contentTypes={contentTypes}
                                    isDeletingLesson={isDeletingLesson}
                                    isDeletingContent={isDeletingContent}
                                    onToggleLessonExpansion={toggleLessonExpansion}
                                    onSetShowContentPopup={setShowContentPopup}
                                    onSetEditingLesson={setEditingLesson}
                                    onDeleteLesson={handleDeleteLesson}
                                    onAddContent={handleAddContent}
                                    onDeleteContent={handleDeleteContent}
                                />
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

                {/* Content popup overlay */}
                {showContentPopup && (
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowContentPopup(null)}
                    />
                )}
            </div>
        </DragDropProvider>
    );
}