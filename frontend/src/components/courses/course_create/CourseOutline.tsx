"use client";

import { CourseHeaderContext } from "@/app/courses/create/[course_id]/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
    CoursePopulated,
    CreateLessonRequest,
    CreateChapterRequest,
    useCreateLessonMutation,
    useDeleteLessonMutation,
    useGetLessonsQuery,
    useCreateChapterMutation,
    useDeleteChapterMutation,
    useGetChaptersQuery,
    useGetContentByLessonQuery,
    useCreateContentMutation,
    useDeleteContentMutation
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
    Video,
    X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState, useCallback } from "react";
// import { CourseHeaderContext } from "../layout";

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

// Move CreationForm component outside to prevent recreation
const CreationForm = ({
    type,
    value,
    onChange,
    onSubmit,
    onCancel,
    isLoading,
    placeholder,
    className = ""
}: {
    type: 'lesson' | 'chapter';
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
    placeholder: string;
    className?: string;
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    const clearInput = () => {
        onChange("");
    };

    return (
        <div className={`flex items-center gap-3 mb-6 p-4 rounded-md bg-white ${className}`}>
            <div className="flex-1 relative">
                <Input
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="pr-20"
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                {value && (
                    <button
                        onClick={clearInput}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <Button
                onClick={onSubmit}
                disabled={isLoading || !value.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6"
            >
                {isLoading ? "Creating..." : "Create"}
            </Button>
            <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={onCancel}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
};

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

    const lessons = lessonsData?.data?.lessons || [];
    const chapters = chaptersData?.data?.chapters || [];
    const isLoading = isLoadingLessons || isLoadingChapters;
    const error = lessonsError || chaptersError;

    useEffect(() => {
        setShowHeaderActions(lessons.length > 0 || chapters.length > 0);
    }, [lessons.length, chapters.length, setShowHeaderActions]);

    const handleCreateLesson = useCallback(async () => {
        if (!course?._id || !lessonName.trim()) {
            showErrorToast("Please enter a lesson name");
            return;
        }

        try {
            const lessonData: CreateLessonRequest = {
                title: lessonName,
                description: "",
                order: lessons.length + 1,
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
                language: 'en'
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
                order: chapters.length + 1,
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
    }, [course?._id, chapterName, chapters.length, createChapter]);

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
            router.push(`/courses/create/${course._id}/courseOutline/${lessonId}/content/${result.data.content._id}/edit`);
        } catch (error) {
            console.error(`Error creating ${contentType.label} content:`, error);
            showErrorToast(`Failed to create ${contentType.label} content`);
        }
    };

    // Helper function to get default content data based on type
    const getDefaultContentData = (type: LessonContent['type']) => {
        switch (type) {
            case 'text':
                return { text: '' };
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
        setLessonName("");
        setChapterName("");
    }, []);

    // Content Item Component
    const ContentItem = ({ content, lessonId }: { content: LessonContent; lessonId: string }) => {
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
                            onClick={() => router.push(`/courses/create/${course?._id}/courseOutline/${lessonId}/content/${content._id}/edit`)}
                            className="text-gray-600 hover:text-blue-600 p-1 h-auto"
                        >
                            <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(lessonId, content._id)}
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

    // Reusable Lesson Display Component
    const LessonItem = ({ lesson, isInChapter = false }: { lesson: any; isInChapter?: boolean }) => {
        const isExpanded = expandedLessons.has(lesson._id);

        // Query lesson content
        const { data: contentData } = useGetContentByLessonQuery(
            { courseId: course?._id || "", lessonId: lesson._id },
            { skip: !course?._id || !lesson._id }
        );

        const content = contentData?.data?.content || [];

        return (
            <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative">
                {/* Lesson Header */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
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
                                onClick={() => setShowContentPopup(lesson._id)}
                                className="text-black border-gray-300 hover:bg-gray-50"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Content
                            </Button>
                            {content.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleLessonExpansion(lesson._id)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    {isExpanded ? 'Collapse' : 'Expand'}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLesson(lesson._id)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson._id)}
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
                                        onClick={() => handleAddContent(lesson._id, contentType)}
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

    // Empty State Component
    const EmptyState = () => (
        <div className="flex h-[50vh] flex-col justify-center items-center">
            <h1>Start Creating your course</h1>
            <p>Create a lesson or a chapter to get started with building your courses</p>
            <div className="flex gap-4 mt-2">
                <Button
                    variant="outline"
                    className="border border-blue-600 text-blue-600 flex items-center gap-2"
                    onClick={() => setCreateFirstLesson(true)}
                >
                    <Plus size={16} /> Add Lesson
                </Button>
                <Button
                    variant="outline"
                    className="border border-blue-600 text-blue-600 flex items-center gap-2"
                    onClick={() => setCreateFirstChapter(true)}
                >
                    <List size={16} /> Add Chapter
                </Button>
            </div>
        </div>
    );

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
                return (
                    <div className="space-y-3">
                        {/* Display chapters first */}
                        {chapters.map((chapter) => (
                            <div key={`chapter-${chapter._id}`} className="space-y-2">
                                {/* Chapter Header */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow relative">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                            <div className="flex items-center gap-2">
                                                <List className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-blue-800">{chapter.title}</span>
                                                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                                                    Chapter
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
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

                                {/* Chapter Lessons */}
                                {chapter.lessons && chapter.lessons.length > 0 && (
                                    <div className="ml-6 space-y-2">
                                        {chapter.lessons.map((lesson) => (
                                            <LessonItem
                                                key={`chapter-lesson-${lesson._id}`}
                                                lesson={lesson}
                                                isInChapter={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Display standalone lessons */}
                        {lessons.filter(lesson => !lesson.chapter).map((lesson) => (
                            <LessonItem
                                key={`standalone-lesson-${lesson._id}`}
                                lesson={lesson}
                                isInChapter={false}
                            />
                        ))}

                        {/* Inline creation forms */}
                        {isCreatingNewLesson && (
                            <CreationForm
                                type="lesson"
                                value={lessonName}
                                onChange={setLessonName}
                                onSubmit={handleCreateLesson}
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
                );

            case 'empty':
            default:
                return <EmptyState />;
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
        if (isCreatingNewLesson || isCreatingNewChapter) {
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