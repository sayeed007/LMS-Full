"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetLessonsQuery,
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useReorderLessonsMutation,
  CourseLesson,
  CreateLessonRequest
} from "@/store/api/courseApi";
import { CoursePopulated } from "@/store/api/courseApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  BookOpen,
  Video,
  FileText,
  Plus,
  Trash2,
  Edit,
  Play,
  Quiz,
  GripVertical,
  MoreVertical
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { CourseHeaderContext } from "../layout";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { QuizCreationModal, QuizData } from "@/components/course-creation/QuizCreationModal";

interface LessonFormData {
  title: string;
  description: string;
  type: CourseLesson['type'];
  content: string;
  duration: number;
  videoUrl?: string;
  isPreview: boolean;
}

const initialLessonForm: LessonFormData = {
  title: "",
  description: "",
  type: "text",
  content: "",
  duration: 0,
  videoUrl: "",
  isPreview: false,
};

const lessonTypes = [
  { value: "text", label: "Text Lesson", icon: FileText },
  { value: "video", label: "Video Lesson", icon: Video },
  { value: "quiz", label: "Quiz", icon: Quiz },
  { value: "assignment", label: "Assignment", icon: BookOpen },
] as const;

interface CourseOutlineProps {
  course?: CoursePopulated;
}

export default function CourseOutline({ course }: CourseOutlineProps) {
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonFormData>(initialLessonForm);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const { setShowHeaderActions } = useContext(CourseHeaderContext);

  // API hooks
  const {
    data: lessonsData,
    isLoading,
    error
  } = useGetLessonsQuery(
    { courseId: course?._id || "" },
    { skip: !course?._id }
  );

  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteLessonMutation();
  const [reorderLessons] = useReorderLessonsMutation();

  const lessons = lessonsData?.data?.lessons || [];

  useEffect(() => {
    setShowHeaderActions(lessons.length > 0 || isCreatingLesson);
  }, [lessons.length, isCreatingLesson, setShowHeaderActions]);

  const handleCreateLesson = async () => {
    if (!course?._id || !lessonForm.title.trim()) {
      showErrorToast("Please fill in required fields");
      return;
    }

    try {
      const lessonData: CreateLessonRequest = {
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content,
        type: lessonForm.type,
        duration: lessonForm.duration,
        order: lessons.length + 1,
        isPreview: lessonForm.isPreview,
        ...(lessonForm.videoUrl && { videoUrl: lessonForm.videoUrl }),
      };

      await createLesson({
        courseId: course._id,
        data: lessonData,
      }).unwrap();

      showSuccessToast("Lesson created successfully!");
      setLessonForm(initialLessonForm);
      setIsCreatingLesson(false);
    } catch (error) {
      console.error("Error creating lesson:", error);
      showErrorToast("Failed to create lesson");
    }
  };

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

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !course?._id) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedLessons = items.map((lesson, index) => ({
      _id: lesson._id,
      order: index + 1,
    }));

    try {
      await reorderLessons({
        courseId: course._id,
        lessons: reorderedLessons,
      }).unwrap();
    } catch (error) {
      console.error("Error reordering lessons:", error);
      showErrorToast("Failed to reorder lessons");
    }
  };

  const handleLessonTypeSelect = (type: CourseLesson['type']) => {
    if (type === 'quiz') {
      setShowQuizModal(true);
      setIsCreatingLesson(false);
    } else {
      setLessonForm({ ...lessonForm, type });
      setIsCreatingLesson(true);
    }
  };

  const handleQuizSave = async (quiz: QuizData) => {
    if (!course?._id) {
      showErrorToast("Course not found");
      return;
    }

    try {
      // Create a quiz lesson with the quiz data embedded in content
      const lessonData: CreateLessonRequest = {
        title: quiz.title,
        description: quiz.description,
        content: JSON.stringify({
          quizData: quiz,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          allowRetakes: quiz.allowRetakes,
          showResults: quiz.showResults
        }),
        type: 'quiz',
        duration: quiz.timeLimit,
        order: lessons.length + 1,
        isPreview: false,
      };

      await createLesson({
        courseId: course._id,
        data: lessonData,
      }).unwrap();

      showSuccessToast("Quiz lesson created successfully!");
      setShowQuizModal(false);
      setQuizData(null);
    } catch (error) {
      console.error("Error creating quiz lesson:", error);
      showErrorToast("Failed to create quiz lesson");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load lessons</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Outline</h2>
        <Button
          onClick={() => setIsCreatingLesson(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Lesson Type Selection */}
      {isCreatingLesson && !lessonForm.type && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Choose Lesson Type</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {lessonTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleLessonTypeSelect(type.value)}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-sm">{type.label}</span>
              </Button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCreatingLesson(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Lesson Creation Form */}
      {isCreatingLesson && lessonForm.type && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Create {lessonTypes.find(t => t.value === lessonForm.type)?.label}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Enter lesson title"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Enter lesson description"
                className="w-full border rounded-md px-3 py-2 min-h-[80px]"
              />
            </div>

            {lessonForm.type === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <Input
                  value={lessonForm.videoUrl || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="Enter video URL"
                  className="w-full"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={lessonForm.isPreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPreview" className="text-sm font-medium">
                  Free Preview
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Enter lesson content"
                className="w-full border rounded-md px-3 py-2 min-h-[120px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingLesson(false);
                  setLessonForm(initialLessonForm);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={isCreating || !lessonForm.title.trim() || !lessonForm.content.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isCreating ? "Creating..." : "Create Lesson"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20"></div>
          ))}
        </div>
      ) : lessons.length > 0 ? (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Lessons ({lessons.length})</h3>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lessons">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const LessonIcon = lessonTypes.find(t => t.value === lesson.type)?.icon || FileText;

                    return (
                      <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-50 border rounded-lg p-4 flex items-center justify-between group hover:bg-gray-100 transition-colors ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                  <LessonIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{lesson.title}</h4>
                                  <p className="text-sm text-gray-600">
                                    {lesson.type} • {lesson.duration || 0} min
                                    {lesson.isPreview && " • Free Preview"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson._id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <div className="flex h-[50vh] flex-col justify-center items-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Start Creating Your Course</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Create lessons to build your course content. You can add text lessons, videos, quizzes, and assignments.
          </p>
          <Button
            onClick={() => setIsCreatingLesson(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Lesson
          </Button>
        </div>
      )}

      {/* Quiz Creation Modal */}
      <QuizCreationModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          setQuizData(null);
        }}
        onSave={handleQuizSave}
        initialData={quizData || undefined}
      />
    </div>
  );
}