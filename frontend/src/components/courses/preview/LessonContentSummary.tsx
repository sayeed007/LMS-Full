"use client";

import { useGetContentByLessonQuery } from "@/store/api/courseApi";

interface LessonContentSummaryProps {
  lessonId: string;
  courseId: string;
}

export function LessonContentSummary({
  lessonId,
  courseId,
}: LessonContentSummaryProps) {
  const { data: contentData, isLoading } = useGetContentByLessonQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId }
  );

  const content = contentData?.data?.content || [];

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Loading content...
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">No content available</div>
    );
  }

  // Count content types for summary
  const contentSummary = content.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    // Also count block items
    if (item.type === "block" && item.data?.items) {
      item.data.items.forEach((blockItem) => {
        acc[blockItem.type] = (acc[blockItem.type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const getSummaryText = () => {
    const summaryParts = [];

    if (contentSummary.video) {
      summaryParts.push(
        `${contentSummary.video} video${contentSummary.video > 1 ? "s" : ""}`
      );
    }
    if (contentSummary.text) {
      summaryParts.push(
        `${contentSummary.text} text section${
          contentSummary.text > 1 ? "s" : ""
        }`
      );
    }
    if (contentSummary.audio) {
      summaryParts.push(
        `${contentSummary.audio} audio${contentSummary.audio > 1 ? "s" : ""}`
      );
    }
    if (contentSummary.document) {
      summaryParts.push(
        `${contentSummary.document} document${
          contentSummary.document > 1 ? "s" : ""
        }`
      );
    }
    if (contentSummary.image) {
      summaryParts.push(
        `${contentSummary.image} image${contentSummary.image > 1 ? "s" : ""}`
      );
    }
    if (contentSummary.quiz) {
      summaryParts.push(
        `${contentSummary.quiz} quiz${contentSummary.quiz > 1 ? "zes" : ""}`
      );
    }
    if (contentSummary.assignment) {
      summaryParts.push(
        `${contentSummary.assignment} assignment${
          contentSummary.assignment > 1 ? "s" : ""
        }`
      );
    }
    if (contentSummary.block) {
      summaryParts.push(
        `${contentSummary.block} interactive section${
          contentSummary.block > 1 ? "s" : ""
        }`
      );
    }

    if (summaryParts.length === 0) {
      return `${content.length} content${content.length > 1 ? "s" : ""}`;
    }

    return summaryParts.join(", ");
  };

  return (
    <div className="text-sm text-gray-600">
      <span>📚 {getSummaryText()}</span>
    </div>
  );
}
