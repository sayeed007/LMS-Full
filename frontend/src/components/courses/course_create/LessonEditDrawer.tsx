"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { useUpdateLessonMutation } from "@/store/api/courseApi";
import { CourseLesson } from "@/types/backend-models";
import { useEffect, useState } from "react";

interface LessonEditDrawerProps {
  lesson: CourseLesson | null;
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export function LessonEditDrawer({
  lesson,
  isOpen,
  onClose,
  courseId,
}: LessonEditDrawerProps) {
  const [updateLesson, { isLoading }] = useUpdateLessonMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CourseLesson["type"]>("text");
  const [duration, setDuration] = useState(0);

  // Access control
  const [isPreview, setIsPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Settings
  const [allowComments, setAllowComments] = useState(true);
  const [downloadable, setDownloadable] = useState(false);

  // Populate form when lesson changes
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setDescription(lesson.description || "");
      setType(lesson.type || "text");
      setDuration(lesson.duration || 0);

      setIsPreview(lesson.isPreview || false);
      setIsPublished(lesson.isPublished || false);

      setAllowComments(lesson.settings?.allowComments ?? true);
      setDownloadable(lesson.settings?.downloadable ?? false);
    }
  }, [lesson]);

  const handleSave = async () => {
    if (!lesson || !courseId) return;

    if (!title.trim()) {
      showErrorToast("Lesson title is required");
      return;
    }

    try {
      await updateLesson({
        courseId,
        lessonId: lesson._id,
        data: {
          title: title.trim(),
          description: description.trim(),
          type,
          estimatedDuration: duration,
          isPreview,
          isPublished,
          settings: {
            allowComments,
            downloadable,
            autoComplete: false,
            preventSkipping: false,
            showTranscript: false,
          },
        },
      }).unwrap();

      showSuccessToast("Lesson updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating lesson:", error);
      showErrorToast("Failed to update lesson");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        isOpen={isOpen}
        className="w-full sm:max-w-xl flex flex-col"
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Edit Lesson Details</SheetTitle>
          <SheetDescription>
            Update lesson information and settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as CourseLesson["type"])
                  }
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="live">Live</option>
                  <option value="document">Document</option>
                  <option value="block">Block</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900">
              Access Control
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPreview}
                  onChange={(e) => setIsPreview(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Preview
                  </span>
                  <p className="text-xs text-gray-500">
                    Allow users to preview without enrollment
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Published
                  </span>
                  <p className="text-xs text-gray-500">
                    Make lesson visible to enrolled students
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900">
              Lesson Settings
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Allow Comments
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadable}
                  onChange={(e) => setDownloadable(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Downloadable
                </span>
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
