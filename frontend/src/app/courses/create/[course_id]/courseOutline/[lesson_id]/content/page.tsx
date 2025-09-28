"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  useCreateContentMutation,
  useGetLessonByIdQuery
} from "@/store/api/courseApi";
import { ArrowLeft, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import TextContentEditor from "@/components/content-editors/TextContentEditor";
import MediaContentEditor from "@/components/content-editors/MediaContentEditor";
import { useUploadFileToCloudinaryMutation, useDeleteFileFromCloudinaryMutation } from "@/store/api/uploadApi";
import BlocksContentEditor from "@/components/content-editors/BlocksContentEditor";
import AssignmentContentEditor from "@/components/content-editors/AssignmentContentEditor";
import QuizContentEditor from "@/components/content-editors/QuizContentEditor";

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: any;
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

  useEffect(() => {
    // Get content type from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const typeParam = urlParams.get('type');
      if (typeParam) {
        setContentType(typeParam);
      }
    }
  }, []);

  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState<LessonContent>({
    type: contentType as any,
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

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [uploadFileToCloudinary] = useUploadFileToCloudinaryMutation();
  const [deleteFileFromCloudinary] = useDeleteFileFromCloudinaryMutation();

  const lesson = lessonData?.data?.lesson;

  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title);
      try {
        const parsedContent = JSON.parse(lesson.content || '{}');
        setContent({
          type: contentType as any,
          blocks: parsedContent.blocks || [],
          textContent: parsedContent.textContent || "",
          title: parsedContent.title || "",
          description: parsedContent.description || "",
        });
      } catch (error) {
        console.error("Error parsing lesson content:", error);
      }
    }
  }, [lesson, contentType]);

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
    if (content.publicId && content.resourceType) {
      try {
        await deleteFileFromCloudinary({
          publicId: content.publicId,
          resourceType: content.resourceType
        }).unwrap();
        showSuccessToast('File removed successfully!');
      } catch (error: any) {
        console.error('Error deleting file:', error);
        showErrorToast(error?.data?.message || 'Error removing file. Please try again.');
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
    if (block?.publicId && block?.resourceType) {
      try {
        await deleteFileFromCloudinary({
          publicId: block.publicId,
          resourceType: block.resourceType
        }).unwrap();
        showSuccessToast('File removed successfully!');
      } catch (error: any) {
        console.error('Error deleting file:', error);
        showErrorToast(error?.data?.message || 'Error removing file. Please try again.');
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
    if (contentType === 'blocks') {
      setIsUploading(true);
      setUploadProgress("Processing blocks...");

      const updatedBlocks = [...currentContent.blocks];

      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        const selectedBlockFile = selectedFiles[block.id];

        // Skip text blocks or blocks that already have uploaded files
        if (block.type === 'text' || block.fileUrl) continue;

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
            fileUrl: response.data.url,
            fileName: response.data.fileName,
            fileSize: response.data.fileSize,
            fileType: response.data.fileType,
            publicId: response.data.publicId,
            resourceType: response.data.resourceType
          };

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

        } catch (error: any) {
          setIsUploading(false);
          setUploadProgress("");
          showErrorToast(error?.data?.message || `Failed to upload ${block.type} file. Please try again.`);
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
      if (!currentContent.fileUrl && !selectedFile) {
        showErrorToast("Please select a file before saving");
        return;
      }

      // If there's a selected file but no URL, upload it first
      if (selectedFile && !currentContent.fileUrl) {
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
            fileUrl: response.data.url,
            fileName: response.data.fileName,
            fileSize: response.data.fileSize,
            fileType: response.data.fileType,
            publicId: response.data.publicId,
            resourceType: response.data.resourceType
          };

          setContent(updatedContent);
          currentContent = updatedContent; // Update local variable

          // Clean up local file references
          setSelectedFile(null);
          if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
          }


        } catch (error: any) {
          setIsUploading(false);
          setUploadProgress("");
          showErrorToast(error?.data?.message || "Failed to upload file. Please try again.");
          return;
        }
      }
    }

    try {
      // Update progress for saving
      setUploadProgress("Saving content...");

      // Prepare data based on content type
      let saveData: any = {
        text: currentContent.textContent || "",
        ...currentContent
      };

      // For media and assignment content, ensure URL is included
      if (['video', 'audio', 'document', 'assignment'].includes(contentType) && currentContent.fileUrl) {
        saveData.url = currentContent.fileUrl;
      }


      // Create content using the proper RTK Query mutation
      await createContent({
        courseId,
        lessonId,
        data: {
          title: lessonTitle,
          type: contentType as any,
          data: saveData
        },
      }).unwrap();

      // Clear loading state
      setIsUploading(false);
      setUploadProgress("");

      showSuccessToast("Content saved successfully!");

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



  if (isLoading) {
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
            disabled={isCreating}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isCreating ? "Saving..." : "Save"}
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
            onChange={setContent}
          />
        )}

        {contentType === 'blocks' && (
          <BlocksContentEditor
            content={content}
            onChange={setContent}
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
            onChange={setContent}
            selectedFile={selectedFile}
            filePreviewUrl={filePreviewUrl}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            isUploading={isUploading}
          />
        )}

        {contentType === 'quiz' && (
          <QuizContentEditor
            content={content}
            onChange={setContent}
          />
        )}

        {['video', 'audio', 'document'].includes(contentType) && (
          <MediaContentEditor
            content={content}
            onChange={setContent}
            contentType={contentType}
            selectedFile={selectedFile}
            filePreviewUrl={filePreviewUrl}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            isUploading={isUploading}
          />
        )}

        {/* Fallback if no valid content type */}
        {!['text', 'blocks', 'assignment', 'quiz', 'video', 'audio', 'document'].includes(contentType) && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Invalid Content Type</h2>
            <p className="text-gray-600 mb-4">The content type "{contentType}" is not supported.</p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        )}
      </div>

      {/* Full Page Upload Loader */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing...
            </h3>
            <p className="text-gray-600 mb-4">
              {uploadProgress || "Please wait while we process your request"}
            </p>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Please don't close or refresh this page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}







