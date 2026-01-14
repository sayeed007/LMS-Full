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
import { useUpdateChapterMutation } from "@/store/api/courseApi";
import { CourseChapter } from "@/types/backend-models";
import { useEffect, useState } from "react";

interface ChapterEditDrawerProps {
  chapter: CourseChapter | null;
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export function ChapterEditDrawer({
  chapter,
  isOpen,
  onClose,
  courseId,
}: ChapterEditDrawerProps) {
  const [updateChapter, { isLoading }] = useUpdateChapterMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Populate form when chapter changes
  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || "");
      setDescription(chapter.description || "");
      setIsPublished(chapter.isPublished ?? true);
    }
  }, [chapter]);

  const handleSave = async () => {
    if (!chapter || !courseId) return;

    if (!title.trim()) {
      showErrorToast("Chapter title is required");
      return;
    }

    try {
      await updateChapter({
        courseId,
        chapterId: chapter._id,
        data: {
          title: title.trim(),
          description: description.trim(),
          isPublished,
        },
      }).unwrap();

      showSuccessToast("Chapter updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating chapter:", error);
      showErrorToast("Failed to update chapter");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        isOpen={isOpen}
        className="w-full sm:max-w-xl flex flex-col"
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Edit Chapter Details</SheetTitle>
          <SheetDescription>
            Update chapter information and settings
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
                placeholder="Enter chapter title"
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
                placeholder="Enter chapter description"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900">
              Chapter Settings
            </h3>

            <div className="space-y-3">
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
                    Make chapter visible to enrolled students
                  </p>
                </div>
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
