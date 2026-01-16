"use client";

/**
 * Content Editor Page
 * Uses useContentEditor hook for all logic, this file only handles rendering
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import TextContentEditor from "@/components/content-editors/TextContentEditor";
import MediaContentEditor from "@/components/content-editors/MediaContentEditor";
import VideoContentEditor from "@/components/content-editors/VideoContentEditor";
import BlocksContentEditor from "@/components/content-editors/BlocksContentEditor";
import AssignmentContentEditor from "@/components/content-editors/AssignmentContentEditor";
import QuizContentEditor from "@/components/content-editors/QuizContentEditor";
import { UploadLoader } from "@/components/ui/UploadLoader";
import { useContentEditor } from "@/hooks/useContentEditor";
import type { LessonContent } from "@/types/content-editor";

export default function ContentEditorPage() {
  const {
    // State
    contentType,
    content,
    setContent,
    lessonTitle,
    isEditMode,

    // Loading states
    isLoading,
    isLoadingContent,
    isCreating,
    isUpdating,
    isUploading,
    uploadProgress,

    // File state
    selectedFile,
    filePreviewUrl,
    selectedFiles,
    filePreviewUrls,

    // Handlers
    handleFileSelect,
    handleFileRemove,
    handleBlockFileSelect,
    handleBlockFileRemove,
    handleSave,
    handleBack,
  } = useContentEditor();

  // Loading state
  if (isLoading || (isEditMode && isLoadingContent)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log(content);

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-col gap-1 flex-1">
              {/* Read-only lesson title for reference */}
              <div className="text-sm text-gray-500">
                Lesson:{" "}
                <span className="font-medium text-gray-700">{lessonTitle}</span>
              </div>
              {/* Editable content title for text and blocks types */}
              {(contentType === "text" ||
                contentType === "blocks" ||
                contentType === "block") && (
                <Input
                  value={content.title || ""}
                  onChange={(e) =>
                    setContent({ ...content, title: e.target.value })
                  }
                  className="text-lg font-medium border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Content title (optional)"
                />
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            className="bg-blue-600 text-white hover:bg-blue-700 ml-8"
          >
            {isCreating || isUpdating
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update"
              : "Save"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-6">
        {(() => {
          const handleContentChange = (newContent: unknown) =>
            setContent(newContent as LessonContent);

          switch (contentType) {
            case "text":
              return (
                <TextContentEditor
                  content={content}
                  onChange={handleContentChange}
                />
              );

            case "blocks":
            case "block":
              return (
                <BlocksContentEditor
                  content={content}
                  onChange={handleContentChange}
                  selectedFiles={selectedFiles}
                  filePreviewUrls={filePreviewUrls}
                  onFileSelect={handleBlockFileSelect}
                  onFileRemove={handleBlockFileRemove}
                  isUploading={isUploading}
                />
              );

            case "assignment":
              return (
                <AssignmentContentEditor
                  content={content}
                  onChange={handleContentChange}
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  isUploading={isUploading}
                />
              );

            case "quiz":
              return (
                <QuizContentEditor
                  content={content}
                  onChange={handleContentChange}
                />
              );

            case "video":
              return (
                <VideoContentEditor
                  content={content}
                  onChange={handleContentChange}
                  selectedFile={selectedFile}
                  filePreviewUrl={filePreviewUrl}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  isUploading={isUploading}
                />
              );

            case "audio":
            case "document":
              return (
                <MediaContentEditor
                  content={content}
                  onChange={handleContentChange}
                  contentType={contentType}
                  selectedFile={selectedFile}
                  filePreviewUrl={filePreviewUrl}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  isUploading={isUploading}
                />
              );

            default:
              return (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-4">
                    Invalid Content Type
                  </h2>
                  <p className="text-gray-600 mb-4">
                    The content type &quot;{contentType}&quot; is not supported.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    Go Back
                  </Button>
                </div>
              );
          }
        })()}
      </div>

      {/* Full Page Upload Loader */}
      <UploadLoader isOpen={isUploading} uploadProgress={uploadProgress} />
    </div>
  );
}
