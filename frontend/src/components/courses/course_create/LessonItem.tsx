"use client";

import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  useGetContentByLessonQuery,
  useReorderContentMutation,
} from "@/store/api/courseApi";
import { CourseLesson, LessonContent } from "@/types/backend-models";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  File,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { ContentItem } from "./ContentItem";
import { DragDropProvider } from "./DragDropProvider";
import { SortableContainer } from "./SortableContainer";
import { SortableItem } from "./SortableItem";

interface ContentType {
  id: string;
  type: LessonContent["type"];
  icon: string;
  label: string;
}

interface LessonItemProps {
  lesson: Partial<CourseLesson> & { _id: string; title: string };
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
  onOpenLessonDrawer: (
    lesson: Partial<CourseLesson> & { _id: string; title: string }
  ) => void;
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
  onDeleteContent,
  onOpenLessonDrawer,
}: LessonItemProps) => {
  const isExpanded = expandedLessons.has(lesson._id);

  // Query lesson content
  const { data: contentData } = useGetContentByLessonQuery(
    { courseId: courseId || "", lessonId: lesson._id },
    { skip: !courseId || !lesson._id }
  );

  const content = contentData?.data?.content || [];

  // Sort content by order
  const sortedContent = useMemo(() => {
    return [...content].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [content]);

  // Reorder content mutation
  const [reorderContent, { isLoading: isReorderingContent }] =
    useReorderContentMutation();

  // Handle content drag and drop
  const onContentDragEnd = useCallback(
    async (event: {
      active: { id: string };
      over: { id: string } | null;
      sourceIndex: number;
      targetIndex: number;
    }) => {
      const { sourceIndex, targetIndex } = event;

      if (sourceIndex === targetIndex) {
        return;
      }

      try {
        // Reorder the content array
        const reorderedContent = Array.from(sortedContent);
        const [removed] = reorderedContent.splice(sourceIndex, 1);
        reorderedContent.splice(targetIndex, 0, removed);

        // Create the reorder data with new order values
        const reorderData = reorderedContent.map((item, index) => ({
          _id: item._id,
          order: index + 1,
        }));

        // Call the API to reorder
        await reorderContent({
          courseId,
          lessonId: lesson._id,
          content: reorderData,
        }).unwrap();

        showSuccessToast("Content reordered successfully!");
      } catch (error) {
        console.error("Error reordering content:", error);
        showErrorToast("Failed to reorder content");
      }
    },
    [sortedContent, courseId, lesson._id, reorderContent]
  );

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative mb-6"
      data-lesson-id={lesson._id}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetShowContentPopup(lesson._id)}
        className="text-black font-bold bg-white border-grey-1 hover:bg-off-white-1 absolute bottom-[-17px] left-[45%] rounded-2xl "
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
                if (e.key === "Enter") {
                  onUpdateLesson(lesson._id);
                } else if (e.key === "Escape") {
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
                {/* Collapse/Expand Chevron - moved to left for consistency with chapters */}
                {content.length > 0 && (
                  <button
                    onClick={() => onToggleLessonExpansion(lesson._id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={isExpanded ? "Collapse lesson" : "Expand lesson"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                )}
                <File className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{lesson.title}</span>
                {content.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {content.length} content item{content.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartEditingLesson(lesson._id, lesson.title)}
                title="Rename lesson"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenLessonDrawer(lesson)}
                title="Edit lesson details"
              >
                <Settings className="w-4 h-4" />
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
      {isExpanded && sortedContent.length > 0 && (
        <div className="px-4 pb-4 space-y-2 relative">
          {/* Loading overlay during reordering */}
          {isReorderingContent && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg pointer-events-none">
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-blue-200 flex items-center gap-2 pointer-events-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs font-medium text-gray-700">
                  Reordering...
                </span>
              </div>
            </div>
          )}
          <DragDropProvider
            onDragEnd={onContentDragEnd}
            disabled={isReorderingContent}
          >
            <SortableContainer
              id={`lesson-${lesson._id}-content`}
              items={sortedContent.map((c) => c._id)}
              type="content"
            >
              {sortedContent.map((contentItem) => (
                <SortableItem
                  key={contentItem._id}
                  id={contentItem._id}
                  type="content"
                  data={contentItem as unknown as Record<string, unknown>}
                >
                  <ContentItem
                    content={contentItem}
                    lessonId={lesson._id}
                    courseId={courseId}
                    isDeletingContent={isDeletingContent}
                    onDeleteContent={onDeleteContent}
                  />
                </SortableItem>
              ))}
            </SortableContainer>
          </DragDropProvider>
        </div>
      )}
    </div>
  );
};
