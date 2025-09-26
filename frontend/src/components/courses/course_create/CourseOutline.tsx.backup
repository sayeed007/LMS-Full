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
    GripVertical,
    HelpCircle,
    List,
    Plus,
    Trash2,
    Video
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CreationForm } from './CreationForm';
import { LessonItem } from "./LessonItem";
import { DragDropProvider } from './DragDropProvider';
import { SortableContainer } from './SortableContainer';
import { SortableItem } from './SortableItem';
import { EmptyState } from './EmptyState';

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
    const [showContentPopup, setShowContentPopup] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<string | null>(null);
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
    const [createFirstLesson, setCreateFirstLesson] = useState<boolean>(false);
    const [createFirstChapter, setCreateFirstChapter] = useState<boolean>(false);
    // New state for dynamic creation modes
    const [isCreatingNewLesson, setIsCreatingNewLesson] = useState<boolean>(false);
    const [isCreatingNewChapter, setIsCreatingNewChapter] = useState<boolean>(false);
    // State for creating lessons within chapters
    const [creatingLessonInChapter, setCreatingLessonInChapter] = useState<string | null>(null);
    // State for SSR hydration
    const [isClient, setIsClient] = useState(false);


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

    const lessons = useMemo(() => lessonsData?.data?.lessons || [], [lessonsData?.data?.lessons]);
    const chapters = useMemo(() => chaptersData?.data?.chapters || [], [chaptersData?.data?.chapters]);
    const isLoading = isLoadingLessons || isLoadingChapters;
    const error = lessonsError || chaptersError;

    useEffect(() => {
        setShowHeaderActions(lessons.length > 0 || chapters.length > 0);
    }, [lessons.length, chapters.length, setShowHeaderActions]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleCreateLesson = useCallback(async (chapterId?: string) => {
        if (!course?._id || !lessonName.trim()) {
            showErrorToast("Please enter a lesson name");
            return;
        }

        try {
            const lessonData: CreateLessonRequest = {
                title: lessonName,
                description: "",
                // Remove order - let backend calculate it
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
            setCreatingLessonInChapter(null);
        } catch (error) {
            console.error("Error creating lesson:", error);
            showErrorToast("Failed to create lesson");
        }
    }, [course?._id, lessonName, lessons.length, createLesson]);

    const handleCreateChapter = useCallback(async () => {
        if (!course?._id || !chapterName.trim()) {
            showErrorToast("Please enter a chapter name");
            return;
        }

        try {
            const chapterData: CreateChapterRequest = {
                title: chapterName,
                description: "",
                // Remove order - let backend calculate it
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
            // Create basic content based on type
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

            // Navigate to content editing page
            router.push(`/courses/create/${course._id}/courseOutline/${lessonId}/content/${result?.data?.content._id}/edit`);
        } catch (error) {
            console.error(`Error creating ${contentType.label} content:`, error);
            showErrorToast(`Failed to create ${contentType.label} content`);
        }
    };

    // Helper function to get default content data based on type
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
                        maxFileSize: 10 * 1024 * 1024, // 10MB
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

    // Helper functions to manage creation modes
    const startCreatingLesson = useCallback(() => {
        setIsCreatingNewLesson(true);
        setIsCreatingNewChapter(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setLessonName("");
    }, []);

    const startCreatingChapter = useCallback(() => {
        setIsCreatingNewChapter(true);
        setIsCreatingNewLesson(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setChapterName("");
    }, []);

    const cancelCreation = useCallback(() => {
        setIsCreatingNewLesson(false);
        setIsCreatingNewChapter(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setCreatingLessonInChapter(null);
        setLessonName("");
        setChapterName("");
    }, []);

    const startCreatingLessonInChapter = useCallback((chapterId: string) => {
        setCreatingLessonInChapter(chapterId);
        setIsCreatingNewLesson(false);
        setIsCreatingNewChapter(false);
        setCreateFirstLesson(false);
        setCreateFirstChapter(false);
        setLessonName("");
    }, []);

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

        console.log('Drag ended:', event);

        try {
            if (active.type === 'chapter') {
                // Reorder chapters
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
            } else if (active.type === 'lesson') {
                // Handle lesson reordering (both standalone and within chapters)
                if (sourceContainer.startsWith('chapter-') && targetContainer.startsWith('chapter-')) {
                    // Moving lessons within or between chapters
                    const sourceChapterId = sourceContainer.replace('chapter-', '');
                    const destChapterId = targetContainer.replace('chapter-', '');

                    if (sourceChapterId === destChapterId) {
                        // Reordering within same chapter
                        const sourceChapter = chapters.find(ch => ch._id === sourceChapterId);
                        if (sourceChapter?.lessons) {
                            const reorderedLessons = Array.from(sourceChapter.lessons);
                            const [removed] = reorderedLessons.splice(sourceIndex, 1);
                            reorderedLessons.splice(targetIndex, 0, removed);

                            const reorderData = reorderedLessons.map((lesson, index) => ({
                                _id: lesson._id,
                                order: index + 1
                            }));

                            await reorderLessons({
                                courseId: course._id,
                                lessons: reorderData
                            }).unwrap();

                            showSuccessToast('Lessons reordered successfully!');
                        }
                    }
                } else if (sourceContainer === 'standalone-lessons' && targetContainer === 'standalone-lessons') {
                    // Reordering standalone lessons
                    const standaloneLessons = lessons.filter(lesson => !lesson.chapter);
                    const reorderedLessons = Array.from(standaloneLessons);
                    const [removed] = reorderedLessons.splice(sourceIndex, 1);
                    reorderedLessons.splice(targetIndex, 0, removed);

                    const reorderData = reorderedLessons.map((lesson, index) => ({
                        _id: lesson._id,
                        order: index + 1
                    }));

                    await reorderLessons({
                        courseId: course._id,
                        lessons: reorderData
                    }).unwrap();

                    showSuccessToast('Lessons reordered successfully!');
                }
            }
        } catch (error) {
            console.error('Error reordering:', error);
            showErrorToast('Failed to reorder items');
        }
    }, [chapters, lessons, course?._id, reorderChapters, reorderLessons]);

    // Determine current state and what to render
    const getCurrentState = () => {
        if (isLoading) return 'loading';
        if (createFirstLesson) return 'first-lesson';
        if (createFirstChapter) return 'first-chapter';
        if (lessons.length > 0 || chapters.length > 0) return 'has-content';
        return 'empty';
    };

    const renderContent = () => {
        const state = getCurrentState();

        switch (state) {
            case 'loading':
                return (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16"></div>
                        ))}
                    </div>
                );

            case 'first-lesson':
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

            case 'first-chapter':
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

            case 'has-content':
                if (!isClient) {
                    // Show loading state while client hydrates
                    return (
                        <div className="space-y-3">
                            {/* Display chapters first - Static version for SSR */}
                            {chapters.map((chapter) => (
                                <div key={chapter._id} className="space-y-2 mb-3">
                                    {/* Chapter Header */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow relative">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <List className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-blue-800">{chapter.title}</span>
                                                    <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                                                        Chapter {chapter.lessons?.length ? `(${chapter.lessons.length} lessons)` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => startCreatingLessonInChapter(chapter._id)}
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
                                                    onClick={() => handleDeleteChapter(chapter._id)}
                                                    disabled={isDeletingChapter}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chapter Lessons - Static */}
                                    {chapter.lessons && chapter.lessons.length > 0 && (
                                        <div className="ml-6 space-y-2">
                                            {chapter.lessons.map((lesson) => (
                                                <LessonItem
                                                    key={lesson._id}
                                                    lesson={lesson}
                                                    courseId={course?._id || ""}
                                                    isInChapter={true}
                                                    dragHandleProps={{}}
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
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Display standalone lessons - Static */}
                            {lessons.filter(lesson => !lesson.chapter).map((lesson) => (
                                <LessonItem
                                    key={lesson._id}
                                    lesson={lesson}
                                    courseId={course?._id || ""}
                                    isInChapter={false}
                                    dragHandleProps={{}}
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
                            ))}
                        </div>
                    );
                }

                return (
                    <DragDropProvider
                        onDragEnd={onDragEnd}
                        onDragStart={(item) => console.log('Drag started:', item)}
                    >
                        <div className="space-y-3">
                            {/* Display chapters first */}
                            {chapters.length > 0 && (
                                <SortableContainer
                                    id="chapters"
                                    items={chapters.map(ch => ch._id)}
                                    type="CHAPTER"
                                >
                                    {chapters.map((chapter, index) => (
                                        <SortableItem
                                            key={chapter._id}
                                            id={chapter._id}
                                            type="chapter"
                                            data={chapter}
                                            className="space-y-2 mb-3"
                                        >
                                            <div>
                                                {/* Chapter Header */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow relative">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <List className="w-4 h-4 text-blue-600" />
                                                                            <span className="font-semibold text-blue-800">{chapter.title}</span>
                                                                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                                                                                Chapter {chapter.lessons?.length ? `(${chapter.lessons.length} lessons)` : ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => startCreatingLessonInChapter(chapter._id)}
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
                                                                            onClick={() => handleDeleteChapter(chapter._id)}
                                                                            disabled={isDeletingChapter}
                                                                            className="text-red-600 hover:text-red-700"
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
                                                                        onCancel={cancelCreation}
                                                                        isLoading={isCreatingLesson}
                                                                        placeholder="Enter Lesson Name"
                                                                        className="border-blue-200"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Chapter Lessons */}
                                                            {chapter.lessons && chapter.lessons.length > 0 && (
                                                                <DroppableWrapper droppableId={`chapter-${chapter._id}`} type="LESSON" className="ml-6 space-y-2">
                                                                    {(provided) => (
                                                                        <>
                                                                            {chapter.lessons.map((lesson, lessonIndex) => (
                                                                                <Draggable key={lesson._id} draggableId={lesson._id} index={lessonIndex}>
                                                                                    {(provided, snapshot) => (
                                                                                        <div
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            className={snapshot.isDragging ? 'opacity-75' : ''}
                                                                                        >
                                                                                            <LessonItem
                                                                                                lesson={lesson}
                                                                                                courseId={course?._id || ""}
                                                                                                isInChapter={true}
                                                                                                dragHandleProps={provided.dragHandleProps}
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
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </DroppableWrapper>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </>
                                    )}
                                </DroppableWrapper>
                            )}

                            {/* Display standalone lessons */}
                            {lessons.filter(lesson => !lesson.chapter).length > 0 && (
                                <DroppableWrapper droppableId="standalone-lessons" type="LESSON" className="space-y-2">
                                    {(provided) => (
                                        <>
                                            {lessons.filter(lesson => !lesson.chapter).map((lesson, index) => (
                                                <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={snapshot.isDragging ? 'opacity-75' : ''}
                                                        >
                                                            <LessonItem
                                                                lesson={lesson}
                                                                courseId={course?._id || ""}
                                                                isInChapter={false}
                                                                dragHandleProps={provided.dragHandleProps}
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
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </>
                                    )}
                                </DroppableWrapper>
                            )}

                            {/* Inline creation forms */}
                            {isCreatingNewLesson && (
                                <CreationForm
                                    type="lesson"
                                    value={lessonName}
                                    onChange={setLessonName}
                                    onSubmit={() => handleCreateLesson()}
                                    onCancel={cancelCreation}
                                    isLoading={isCreatingLesson}
                                    placeholder="Enter Lesson Name"
                                    className="border-blue-200"
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
                                    className="border-blue-200"
                                />
                            )}

                            {/* Add buttons */}
                            {showAddLessonAndChapterButtons()}
                        </div>
                    </DragDropProvider>
                );

            case 'empty':
            default:
                return (
                    <EmptyState
                        onCreateFirstLesson={() => setCreateFirstLesson(true)}
                        onCreateFirstChapter={() => setCreateFirstChapter(true)}
                    />
                );
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-600">Failed to load lessons</p>
            </div>
        );
    }

    {/* Add Lesson and Chapter Buttons */ }
    const showAddLessonAndChapterButtons = () => {
        // If no lessons or chapters exist yet, trigger first-time creation
        const hasNoContent = lessons.length === 0 && chapters.length === 0;

        // Don't show buttons if user is currently creating something
        if (isCreatingNewLesson || isCreatingNewChapter || creatingLessonInChapter) {
            return null;
        }

        return (
            <div className="flex gap-3 mb-8">
                <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => {
                        if (hasNoContent) {
                            setCreateFirstLesson(true);
                        } else {
                            startCreatingLesson();
                        }
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                </Button>
                <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => {
                        if (hasNoContent) {
                            setCreateFirstChapter(true);
                        } else {
                            startCreatingChapter();
                        }
                    }}
                >
                    <List className="w-4 h-4 mr-2" />
                    Add Chapter
                </Button>
            </div>
        )
    }

    return (
        <div className="mt-6">
            {renderContent()}

            {/* Click outside to close popup */}
            {showContentPopup && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowContentPopup(null)}
                />
            )}
        </div>
    );
}