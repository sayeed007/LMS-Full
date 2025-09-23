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
  Plus,
  Trash2,
  Edit,
  GripVertical,
  X,
  List,
  FileText,
  Video,
  File,
  HelpCircle,
  Clipboard,
  Grid3X3
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { CourseHeaderContext } from "../layout";
import { useRouter } from "next/navigation";

interface CourseOutlineProps {
  course?: CoursePopulated;
}

interface ContentType {
  id: string;
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  icon: any;
  label: string;
}

const contentTypes: ContentType[] = [
  { id: 'text', type: 'text', icon: FileText, label: 'Text' },
  { id: 'blocks', type: 'blocks', icon: Grid3X3, label: 'Blocks' },
  { id: 'video', type: 'video', icon: Video, label: 'Video' },
  { id: 'document', type: 'document', icon: File, label: 'Document' },
  { id: 'quiz', type: 'quiz', icon: HelpCircle, label: 'Quiz' },
  { id: 'assignment', type: 'assignment', icon: Clipboard, label: 'Assignment' },
];

export default function CourseOutline({ course }: CourseOutlineProps) {
  const [lessonName, setLessonName] = useState("");
  const [showContentPopup, setShowContentPopup] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const { setShowHeaderActions } = useContext(CourseHeaderContext);
  const router = useRouter();

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

  const lessons = lessonsData?.data?.lessons || [];

  useEffect(() => {
    setShowHeaderActions(lessons.length > 0);
  }, [lessons.length, setShowHeaderActions]);

  const handleCreateLesson = async () => {
    if (!course?._id || !lessonName.trim()) {
      showErrorToast("Please enter a lesson name");
      return;
    }

    try {
      const lessonData: CreateLessonRequest = {
        title: lessonName,
        description: "",
        content: JSON.stringify({ blocks: [] }),
        type: 'text',
        duration: 0,
        order: lessons.length + 1,
        isPreview: false,
      };

      await createLesson({
        courseId: course._id,
        data: lessonData,
      }).unwrap();

      showSuccessToast("Lesson created successfully!");
      setLessonName("");
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

  const handleAddContent = (lessonId: string, contentType: ContentType) => {
    setShowContentPopup(null);
    // Navigate to content editing page
    router.push(`/courses/create/${course?._id}/courseOutline/${lessonId}/content?type=${contentType.type}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load lessons</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Lesson Creation Input */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Input
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="Enter Lesson Name"
            className="pr-20"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateLesson();
              }
            }}
          />
          {lessonName && (
            <button
              onClick={() => setLessonName("")}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleCreateLesson}
          disabled={isCreating || !lessonName.trim()}
          className="bg-blue-600 text-white hover:bg-blue-700 px-6"
        >
          {isCreating ? "Creating..." : "Create"}
        </Button>
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Lesson and Chapter Buttons */}
      <div className="flex gap-3 mb-8">
        <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
        <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <List className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {/* Lessons List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow relative"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Drag handle and lesson info */}
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                </div>

                {/* Right side - Action buttons */}
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
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

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
          ))}
        </div>
      )}

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