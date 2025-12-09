"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
  useGetLessonByIdQuery,
  useGetContentByIdQuery
} from "@/store/api/courseApi";
import { ArrowLeft, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TextContentEditor from "@/components/content-editors/TextContentEditor";
import MediaContentEditor from "@/components/content-editors/MediaContentEditor";
import { useUploadFileToCloudinaryMutation, useDeleteFileFromCloudinaryMutation } from "@/store/api/uploadApi";
import BlocksContentEditor from "@/components/content-editors/BlocksContentEditor";
import AssignmentContentEditor from "@/components/content-editors/AssignmentContentEditor";
import QuizContentEditor from "@/components/content-editors/QuizContentEditor";
import { UploadLoader } from "@/components/ui/UploadLoader";
import { decodeHTMLEntities } from "@/lib/html-utils";

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string | { url?: string; text?: string; [key: string]: unknown };
  order: number;
}

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: ContentBlock[];
  textContent?: string;
  title?: string;
  description?: string;
}

export default function ContentEditor() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;
  const lessonId = params.lesson_id as string;

  const [contentType, setContentType] = useState<string>('text');
  const [contentId, setContentId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    // Get content type and contentId from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const typeParam = urlParams.get('type');
      const contentIdParam = urlParams.get('contentId');

      if (typeParam) {
        setContentType(typeParam);
      }

      if (contentIdParam) {
        setContentId(contentIdParam);
        setIsEditMode(true);
      }
    }
  }, []);

  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState<LessonContent>({
    type: (contentType as 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment') || 'text',
    blocks: [],
    textContent: "",
  });

  // File upload state - lifted up from MediaContentEditor
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Multiple file management for blocks content
  const [selectedFiles, setSelectedFiles] = useState<{ [blockId: string]: File | null }>({});
  const [filePreviewUrls, setFilePreviewUrls] = useState<{ [blockId: string]: string | null }>({});

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // API hooks
  const { data: lessonData, isLoading } = useGetLessonByIdQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId }
  );

  // Fetch specific content when in edit mode
  const { data: contentData, isLoading: isLoadingContent } = useGetContentByIdQuery(
    { courseId, lessonId, contentId: contentId! },
    { skip: !isEditMode || !contentId || !courseId || !lessonId }
  );

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [uploadFileToCloudinary] = useUploadFileToCloudinaryMutation();
  const [deleteFileFromCloudinary] = useDeleteFileFromCloudinaryMutation();

  const lesson = lessonData?.data?.lesson;
  const existingContent = contentData?.data?.content;

  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title);
    }
  }, [lesson]);

  // Separate effect to load content in edit mode
  useEffect(() => {
    if (isEditMode && existingContent) {
      try {
        const parsedData = existingContent.data ? (typeof existingContent.data === 'string' ? JSON.parse(existingContent.data) : existingContent.data) : {};

        // Decode HTML entities in textContent if present
        const textContent = parsedData.textContent || parsedData.text || "";
        const decodedTextContent = textContent ? decodeHTMLEntities(textContent) : "";

        // Set the content with all fields
        setContent({
          type: (contentType as 'text' | 'document' | 'video' | 'quiz' | 'assignment' | 'blocks') || 'text',
          blocks: parsedData.blocks || [],
          textContent: decodedTextContent,
          title: existingContent.title || "",
          description: parsedData.description || "",
          ...parsedData
        });

        // For media content (video, audio, document, assignment), set file preview if URL exists
        if (['video', 'audio', 'document', 'assignment'].includes(contentType) && parsedData.fileUrl) {
          setFilePreviewUrl(parsedData.fileUrl);
        }

        // For blocks content, set file previews for each block that has a fileUrl
        if ((contentType === 'blocks' || contentType === 'block') && parsedData.blocks) {
          const blockPreviews: { [blockId: string]: string | null } = {};
          parsedData.blocks.forEach((block: { id: string; fileUrl?: string }) => {
            if (block.fileUrl) {
              blockPreviews[block.id] = block.fileUrl;
            }
          });
          if (Object.keys(blockPreviews).length > 0) {
            setFilePreviewUrls(blockPreviews);
          }
        }
      } catch (error) {
        console.error("Error parsing content data:", error);
      }
    }
  }, [isEditMode, existingContent, contentType]);

  // File handling functions - moved from MediaContentEditor
  const handleFileSelect = (file: File) => {
    // Check file size (150MB limit)
    const maxSize = 150 * 1024 * 1024; // 150MB in bytes
    if (file.size > maxSize) {
      showErrorToast('File size exceeds 150MB limit');
      return;
    }

    // Store file locally and create preview URL
    setSelectedFile(file);

    // Create preview URL for display
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    // Update content with local file info (no upload yet)
    setContent(prevContent => ({
      ...prevContent,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      // Clear any existing uploaded file data
      fileUrl: undefined,
      publicId: undefined,
      resourceType: undefined
    }));
  };

  const handleFileRemove = async () => {
    // If there's an uploaded file, delete it from Cloudinary
    if ((content as { publicId?: string; resourceType?: string }).publicId && (content as { publicId?: string; resourceType?: string }).resourceType) {
      try {
        await deleteFileFromCloudinary({
          publicId: (content as { publicId?: string; resourceType?: string }).publicId!,
          resourceType: (content as { publicId?: string; resourceType?: string }).resourceType!
        }).unwrap();
        showSuccessToast('File removed successfully!');
      } catch (error) {
        console.error('Error deleting file:', error);
        const apiError = error as { data?: { message?: string } };
        showErrorToast(apiError?.data?.message || 'Error removing file. Please try again.');
      }
    }

    // Clean up file state
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setSelectedFile(null);

    // Clear file data from content
    setContent(prevContent => ({
      ...prevContent,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      fileUrl: undefined,
      publicId: undefined,
      resourceType: undefined
    }));
  };

  // File handling functions for blocks content
  const handleBlockFileSelect = (blockId: string, file: File) => {
    // Check file size (150MB limit)
    const maxSize = 150 * 1024 * 1024; // 150MB in bytes
    if (file.size > maxSize) {
      showErrorToast('File size exceeds 150MB limit');
      return;
    }

    // Store file locally and create preview URL
    setSelectedFiles(prev => ({ ...prev, [blockId]: file }));

    // Create preview URL for display
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrls(prev => ({ ...prev, [blockId]: previewUrl }));

    // Update the specific block with local file info
    setContent(prevContent => ({
      ...prevContent,
      blocks: prevContent.blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              // Clear any existing uploaded file data
              fileUrl: undefined,
              publicId: undefined,
              resourceType: undefined
            }
          : block
      )
    }));
  };

  const handleBlockFileRemove = async (blockId: string) => {
    // Find the block to get cloudinary info
    const block = content.blocks.find(b => b.id === blockId);

    // If there's an uploaded file, delete it from Cloudinary
    if ((block as { publicId?: string; resourceType?: string })?.publicId && (block as { publicId?: string; resourceType?: string })?.resourceType) {
      try {
        await deleteFileFromCloudinary({
          publicId: (block as { publicId?: string; resourceType?: string }).publicId!,
          resourceType: (block as { publicId?: string; resourceType?: string }).resourceType!
        }).unwrap();
        showSuccessToast('File removed successfully!');
      } catch (error) {
        console.error('Error deleting file:', error);
        const apiError = error as { data?: { message?: string } };
        showErrorToast(apiError?.data?.message || 'Error removing file. Please try again.');
      }
    }

    // Clean up file state
    const previewUrl = filePreviewUrls[blockId];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setFilePreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[blockId];
        return newUrls;
      });
    }

    setSelectedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[blockId];
      return newFiles;
    });

    // Clear file data from the specific block
    setContent(prevContent => ({
      ...prevContent,
      blocks: prevContent.blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              fileName: undefined,
              fileSize: undefined,
              fileType: undefined,
              fileUrl: undefined,
              publicId: undefined,
              resourceType: undefined
            }
          : block
      )
    }));
  };

  const handleSave = async () => {
    if (!courseId || !lessonId) return;

    let currentContent = content; // Use local variable to track current content

    // For blocks content, upload files for each block that needs it
    if (contentType === 'blocks' || contentType === 'block') {
      setIsUploading(true);
      setUploadProgress("Processing blocks...");

      const updatedBlocks = [...currentContent.blocks];

      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        const selectedBlockFile = selectedFiles[block.id];

        // Skip text blocks or blocks that already have uploaded files
        if (block.type === 'text' || (block as { fileUrl?: string }).fileUrl) continue;

        // Skip embed videos (they don't need file upload)
        if (block.type === 'video' && (block as { videoType?: string }).videoType === 'embed') continue;

        // Skip blocks without selected files
        if (!selectedBlockFile) continue;

        try {
          setUploadProgress(`Uploading ${block.type} file ${i + 1}...`);

          // Create FormData for upload
          const formData = new FormData();
          formData.append('file', selectedBlockFile);
          formData.append('contentType', block.type);

          // Upload to Cloudinary via backend
          const response = await uploadFileToCloudinary(formData).unwrap();

          // Update the block with Cloudinary response
          updatedBlocks[i] = {
            ...block,
            ...response.data
          } as ContentBlock;

          // Clean up local file references
          setSelectedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[block.id];
            return newFiles;
          });

          const previewUrl = filePreviewUrls[block.id];
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setFilePreviewUrls(prev => {
              const newUrls = { ...prev };
              delete newUrls[block.id];
              return newUrls;
            });
          }

        } catch (error) {
          setIsUploading(false);
          setUploadProgress("");
          const apiError = error as { data?: { message?: string } };
          showErrorToast(apiError?.data?.message || `Failed to upload ${block.type} file. Please try again.`);
          return;
        }
      }

      // Update current content with all uploaded blocks
      currentContent = { ...currentContent, blocks: updatedBlocks };
      setContent(currentContent);
    }

    // For media and assignment content, upload file if selected
    if (['video', 'audio', 'document', 'assignment'].includes(contentType)) {
      // Check if there's a file selected or already uploaded
      if (!(currentContent as { fileUrl?: string }).fileUrl && !selectedFile) {
        showErrorToast("Please select a file before saving");
        return;
      }

      // If there's a selected file but no URL, upload it first
      if (selectedFile && !(currentContent as { fileUrl?: string }).fileUrl) {
        setIsUploading(true);
        setUploadProgress("Uploading file...");

        try {
          // Create FormData for upload
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('contentType', contentType);

          // Upload to Cloudinary via backend
          const response = await uploadFileToCloudinary(formData).unwrap();

          setUploadProgress("Processing upload...");

          // Update content with Cloudinary response
          const updatedContent = {
            ...currentContent,
            ...response.data
          };

          setContent(updatedContent);
          currentContent = updatedContent; // Update local variable

          // Clean up local file references
          setSelectedFile(null);
          if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
          }


        } catch (error) {
          setIsUploading(false);
          setUploadProgress("");
          const apiError = error as { data?: { message?: string } };
          showErrorToast(apiError?.data?.message || "Failed to upload file. Please try again.");
          return;
        }
      }
    }

    try {
      // Update progress for saving
      setUploadProgress("Saving content...");

      // Prepare data based on content type
      const saveData: Record<string, unknown> = {
        text: currentContent.textContent || "",
        ...currentContent
      };

      // For media and assignment content, ensure URL is included
      if (['video', 'audio', 'document', 'assignment'].includes(contentType) && (currentContent as { fileUrl?: string }).fileUrl) {
        saveData.url = (currentContent as { fileUrl?: string }).fileUrl!;
      }


      // Create or Update content based on mode
      if (isEditMode && contentId) {
        // Update existing content
        await updateContent({
          courseId,
          lessonId,
          contentId,
          data: {
            title: lessonTitle,
            type: (contentType === 'blocks' ? 'block' : contentType as 'text' | 'video' | 'document' | 'quiz' | 'assignment' | 'audio') || 'text',
            data: saveData
          },
        }).unwrap();

        showSuccessToast("Content updated successfully!");
      } else {
        // Create new content
        await createContent({
          courseId,
          lessonId,
          data: {
            title: lessonTitle,
            type: (contentType === 'blocks' ? 'block' : contentType as 'text' | 'video' | 'document' | 'quiz' | 'assignment' | 'audio') || 'text',
            data: saveData
          },
        }).unwrap();

        showSuccessToast("Content saved successfully!");
      }

      // Clear loading state
      setIsUploading(false);
      setUploadProgress("");

      // Navigate back to course outline after successful save
      router.push(`/courses/create/${courseId}`);
    } catch (error) {
      console.error("Error saving content:", error);
      // Clear loading state on error
      setIsUploading(false);
      setUploadProgress("");
      showErrorToast("Failed to save content");
    }
  };

  const handleBack = () => {
    router.back();
  };



  if (isLoading || (isEditMode && isLoadingContent)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="text-lg font-medium border-none shadow-none px-0 focus:ring-0"
                placeholder="Lesson title"
              />
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {(isCreating || isUpdating) ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Debug info - remove this later */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p><strong>Debug Info:</strong></p>
          <p>Content Type: {contentType}</p>
          <p>Course ID: {courseId}</p>
          <p>Lesson ID: {lessonId}</p>
        </div>
        {contentType === 'text' && (
          <TextContentEditor
            content={content}
            onChange={(newContent) => setContent(newContent as LessonContent)}
          />
        )}

        {(contentType === 'blocks' || contentType === 'block') && (
          <BlocksContentEditor
            content={content}
            onChange={(newContent) => setContent(newContent as LessonContent)}
            selectedFiles={selectedFiles}
            filePreviewUrls={filePreviewUrls}
            onFileSelect={handleBlockFileSelect}
            onFileRemove={handleBlockFileRemove}
            isUploading={isUploading}
          />
        )}

        {contentType === 'assignment' && (
          <AssignmentContentEditor
            content={content}
            onChange={(newContent) => setContent(newContent as LessonContent)}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            isUploading={isUploading}
          />
        )}

        {contentType === 'quiz' && (
          <QuizContentEditor
            content={content}
            onChange={(newContent) => setContent(newContent as LessonContent)}
          />
        )}

        {['video', 'audio', 'document'].includes(contentType) && (
          <MediaContentEditor
            content={content}
            onChange={(newContent) => setContent(newContent as LessonContent)}
            contentType={contentType}
            selectedFile={selectedFile}
            filePreviewUrl={filePreviewUrl}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            isUploading={isUploading}
          />
        )}

        {/* Fallback if no valid content type */}
        {!['text', 'blocks', 'block', 'assignment', 'quiz', 'video', 'audio', 'document'].includes(contentType) && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Invalid Content Type</h2>
            <p className="text-gray-600 mb-4">The content type &quot;{contentType}&quot; is not supported.</p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        )}
      </div>

      {/* Full Page Upload Loader */}
      <UploadLoader
        isOpen={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}







