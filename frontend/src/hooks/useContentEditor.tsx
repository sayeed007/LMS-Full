"use client";

/**
 * useContentEditor Hook
 * Manages all state, effects, file handling and save logic for the content editor
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { decodeHTMLEntities } from "@/lib/html-utils";
import {
  transformBlockFromBackend,
  transformBlockToBackend,
} from "@/lib/content-transforms";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
  useGetLessonByIdQuery,
  useGetContentByIdQuery,
  useGetContentByLessonQuery,
} from "@/store/api/courseApi";
import {
  useUploadFileToCloudinaryMutation,
  useDeleteFileFromCloudinaryMutation,
} from "@/store/api/uploadApi";
import type {
  LessonContent,
  ContentBlock,
  ParsedContentData,
} from "@/types/content-editor";

export function useContentEditor() {
  const params = useParams();
  const router = useRouter();

  // Extract params with null safety for Next.js 15 compatibility
  const courseId = (params?.course_id as string) || "";
  const lessonId = (params?.lesson_id as string) || "";

  // Content state
  const [contentType, setContentType] = useState<string>("text");
  const [contentId, setContentId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState<LessonContent>({
    type: "text",
    blocks: [],
    textContent: "",
  });

  // Update content type when contentType state changes (for new content)
  useEffect(() => {
    if (!isEditMode) {
      setContent((prev) => ({
        ...prev,
        type: contentType as LessonContent["type"],
      }));
    }
  }, [contentType, isEditMode]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Multiple file management for blocks content
  const [selectedFiles, setSelectedFiles] = useState<{
    [blockId: string]: File | null;
  }>({});
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    [blockId: string]: string | null;
  }>({});

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  // API hooks
  const { data: lessonData, isLoading } = useGetLessonByIdQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId }
  );

  const { data: lessonContentData } = useGetContentByLessonQuery(
    {
      courseId,
      lessonId,
      params: {
        type: contentType as
          | "text"
          | "video"
          | "audio"
          | "document"
          | "quiz"
          | "assignment"
          | "block",
      },
    },
    { skip: !courseId || !lessonId || !contentType || !!contentId }
  );

  const { data: contentData, isLoading: isLoadingContent } =
    useGetContentByIdQuery(
      { courseId, lessonId, contentId: contentId! },
      { skip: !isEditMode || !contentId || !courseId || !lessonId }
    );

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [uploadFileToCloudinary] = useUploadFileToCloudinaryMutation();
  const [deleteFileFromCloudinary] = useDeleteFileFromCloudinaryMutation();

  const lesson = lessonData?.data?.lesson;
  const existingContent = contentData?.data?.content;

  // Parse URL parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const typeParam = urlParams.get("type");
      const contentIdParam = urlParams.get("contentId");

      if (typeParam) {
        setContentType(typeParam);
      }

      if (contentIdParam) {
        setContentId(contentIdParam);
        setIsEditMode(true);
      }
    }
  }, []);

  // Set lesson title when lesson data loads
  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title);
    }
  }, [lesson]);

  // Auto-detect and load existing content
  useEffect(() => {
    if (
      lessonContentData?.data?.content &&
      lessonContentData.data.content.length > 0 &&
      !contentId &&
      !hasAutoLoaded
    ) {
      const existingContent = lessonContentData.data.content[0];
      setContentId(existingContent._id);
      setIsEditMode(true);
      setHasAutoLoaded(true);
      const newUrl = `${window.location.pathname}?type=${contentType}&contentId=${existingContent._id}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [lessonContentData, contentId, contentType, hasAutoLoaded]);

  // Load content in edit mode
  useEffect(() => {
    if (isEditMode && existingContent) {
      try {
        const parsedData: ParsedContentData = existingContent.data
          ? typeof existingContent.data === "string"
            ? (JSON.parse(existingContent.data) as ParsedContentData)
            : (existingContent.data as ParsedContentData)
          : {};

        const textContent = parsedData.textContent || parsedData.text || "";
        const decodedTextContent = textContent
          ? decodeHTMLEntities(textContent)
          : "";

        // Check for blocks in both 'blocks' and 'items' fields (backend may use either)
        // Use items if blocks is empty array (empty arrays are truthy in JS)
        const backendBlocks =
          parsedData.blocks && parsedData.blocks.length > 0
            ? parsedData.blocks
            : parsedData.items || [];
        console.log("parsedData:", parsedData);
        console.log("backendBlocks:", backendBlocks);
        const blocks = backendBlocks.map(transformBlockFromBackend);

        const fileUrl = parsedData.url || parsedData.fileUrl;
        const fileName = parsedData.filename || parsedData.fileName;
        const fileSize = parsedData.size || parsedData.fileSize;
        const fileType = parsedData.mimeType || parsedData.fileType;
        const publicId = parsedData.metadata?.publicId || parsedData.publicId;
        const resourceType =
          parsedData.metadata?.resourceType || parsedData.resourceType;

        let newContent: LessonContent;

        // Title may be at top level of existingContent or inside parsedData
        const contentTitle =
          (existingContent as { title?: string }).title ||
          parsedData.title ||
          "";

        if (contentType === "blocks" || contentType === "block") {
          newContent = {
            type: "blocks",
            textContent: decodedTextContent,
            title: contentTitle,
            description: parsedData.description || "",
            blocks: blocks,
          };
        } else if (contentType === "quiz") {
          newContent = {
            type: "quiz",
            textContent: "",
            title: contentTitle,
            description: parsedData.description || "",
            blocks: [],
            data: { quizId: parsedData.quizId },
          };
        } else if (
          ["video", "audio", "document", "assignment"].includes(contentType)
        ) {
          newContent = {
            type: contentType as "video" | "document" | "assignment",
            textContent: "",
            title: contentTitle,
            description: parsedData.description || "",
            fileUrl,
            fileName,
            fileSize,
            fileType,
            publicId,
            resourceType,
            blocks: [],
          };
        } else {
          newContent = {
            type: "text",
            textContent: decodedTextContent,
            title: contentTitle,
            description: parsedData.description || "",
            blocks: [],
          };
        }
        setContent(newContent);

        if (
          ["video", "audio", "document", "assignment"].includes(contentType) &&
          fileUrl
        ) {
          setFilePreviewUrl(fileUrl);
        }

        if (
          (contentType === "blocks" || contentType === "block") &&
          blocks.length > 0
        ) {
          const blockPreviews: { [blockId: string]: string | null } = {};
          blocks.forEach((block: ContentBlock) => {
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

  // File handling functions
  const handleFileSelect = (file: File) => {
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size exceeds 150MB limit");
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    setContent((prevContent) => ({
      ...prevContent,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: undefined,
      publicId: undefined,
      resourceType: undefined,
    }));
  };

  const handleFileRemove = async () => {
    if (
      (content as { publicId?: string; resourceType?: string }).publicId &&
      (content as { publicId?: string; resourceType?: string }).resourceType
    ) {
      try {
        await deleteFileFromCloudinary({
          publicId: (content as { publicId?: string; resourceType?: string })
            .publicId!,
          resourceType: (
            content as { publicId?: string; resourceType?: string }
          ).resourceType!,
        }).unwrap();
        showSuccessToast("File removed successfully!");
      } catch (error) {
        console.error("Error deleting file:", error);
        const apiError = error as { data?: { message?: string } };
        showErrorToast(
          apiError?.data?.message || "Error removing file. Please try again."
        );
      }
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setSelectedFile(null);

    setContent((prevContent) => ({
      ...prevContent,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      fileUrl: undefined,
      publicId: undefined,
      resourceType: undefined,
    }));
  };

  const handleBlockFileSelect = (blockId: string, file: File) => {
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size exceeds 150MB limit");
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [blockId]: file }));
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrls((prev) => ({ ...prev, [blockId]: previewUrl }));

    setContent((prevContent) => ({
      ...prevContent,
      blocks: (prevContent.blocks || []).map((block) =>
        block.id === blockId
          ? {
              ...block,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              fileUrl: undefined,
              publicId: undefined,
              resourceType: undefined,
            }
          : block
      ),
    }));
  };

  const handleBlockFileRemove = async (blockId: string) => {
    const block = (content.blocks || []).find((b) => b.id === blockId);

    if (
      (block as { publicId?: string; resourceType?: string })?.publicId &&
      (block as { publicId?: string; resourceType?: string })?.resourceType
    ) {
      try {
        await deleteFileFromCloudinary({
          publicId: (block as { publicId?: string; resourceType?: string })
            .publicId!,
          resourceType: (block as { publicId?: string; resourceType?: string })
            .resourceType!,
        }).unwrap();
        showSuccessToast("File removed successfully!");
      } catch (error) {
        console.error("Error deleting file:", error);
        const apiError = error as { data?: { message?: string } };
        showErrorToast(
          apiError?.data?.message || "Error removing file. Please try again."
        );
      }
    }

    const previewUrl = filePreviewUrls[blockId];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setFilePreviewUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[blockId];
        return newUrls;
      });
    }

    setSelectedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[blockId];
      return newFiles;
    });

    setContent((prevContent) => ({
      ...prevContent,
      blocks: (prevContent.blocks || []).map((block) =>
        block.id === blockId
          ? {
              ...block,
              fileName: undefined,
              fileSize: undefined,
              fileType: undefined,
              fileUrl: undefined,
              publicId: undefined,
              resourceType: undefined,
            }
          : block
      ),
    }));
  };

  const handleSave = async () => {
    if (!courseId || !lessonId) return;

    let currentContent = content;

    // For blocks content, upload files
    if (contentType === "blocks" || contentType === "block") {
      setIsUploading(true);
      setUploadProgress("Processing blocks...");

      const updatedBlocks = [...(currentContent.blocks || [])];

      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        const selectedBlockFile = selectedFiles[block.id];

        if (block.type === "text" || (block as { fileUrl?: string }).fileUrl)
          continue;

        if (
          block.type === "video" &&
          (block as { videoType?: string }).videoType === "embed"
        )
          continue;

        if (!selectedBlockFile) continue;

        try {
          setUploadProgress(`Uploading ${block.type} file ${i + 1}...`);

          const formData = new FormData();
          formData.append("file", selectedBlockFile);
          formData.append("contentType", block.type);

          const response = await uploadFileToCloudinary(formData).unwrap();

          if (response.data) {
            updatedBlocks[i] = {
              ...block,
              fileUrl: response.data.url,
              fileName: response.data.fileName,
              fileSize: response.data.fileSize,
              fileType: response.data.fileType,
              publicId: response.data.publicId,
              resourceType: response.data.resourceType,
            } as ContentBlock;
          }

          setSelectedFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[block.id];
            return newFiles;
          });

          const previewUrl = filePreviewUrls[block.id];
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setFilePreviewUrls((prev) => {
              const newUrls = { ...prev };
              delete newUrls[block.id];
              return newUrls;
            });
          }
        } catch (error) {
          setIsUploading(false);
          setUploadProgress("");
          const apiError = error as { data?: { message?: string } };
          showErrorToast(
            apiError?.data?.message ||
              `Failed to upload ${block.type} file. Please try again.`
          );
          return;
        }
      }

      currentContent = { ...currentContent, blocks: updatedBlocks };
      setContent(currentContent);
    }

    // For media content, upload file
    if (["video", "audio", "document", "assignment"].includes(contentType)) {
      if (contentType === "video") {
        const hasFile =
          !!(currentContent as { fileUrl?: string }).fileUrl || !!selectedFile;
        const hasEmbed = !!(currentContent as { embedUrl?: string }).embedUrl;

        if (!hasFile && !hasEmbed) {
          showErrorToast("Please upload a video file or provide an embed URL");
          return;
        }
      } else {
        if (
          !(currentContent as { fileUrl?: string }).fileUrl &&
          !selectedFile
        ) {
          showErrorToast("Please select a file before saving");
          return;
        }
      }

      if (selectedFile && !(currentContent as { fileUrl?: string }).fileUrl) {
        setIsUploading(true);
        setUploadProgress("Uploading file...");

        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("contentType", contentType);

          const response = await uploadFileToCloudinary(formData).unwrap();

          setUploadProgress("Processing upload...");

          if (response.data) {
            const updatedContent = {
              ...currentContent,
              fileUrl: response.data.url,
              fileName: response.data.fileName,
              fileSize: response.data.fileSize,
              fileType: response.data.fileType,
              publicId: response.data.publicId,
              resourceType: response.data.resourceType,
            };

            setContent(updatedContent);
            currentContent = updatedContent;
          }

          setSelectedFile(null);
          if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
          }
        } catch (error) {
          setIsUploading(false);
          setUploadProgress("");
          const apiError = error as { data?: { message?: string } };
          showErrorToast(
            apiError?.data?.message ||
              "Failed to upload file. Please try again."
          );
          return;
        }
      }
    }

    try {
      setUploadProgress("Saving content...");

      const saveData: Record<string, unknown> = {};

      if (contentType === "text") {
        saveData.text = currentContent.textContent || "";
        if (currentContent.title) {
          saveData.title = currentContent.title;
        }
      }

      if (contentType === "blocks" || contentType === "block") {
        saveData.blocks = currentContent.blocks
          ? currentContent.blocks.map(transformBlockToBackend)
          : [];
        if (currentContent.title) {
          saveData.title = currentContent.title;
        }
      }

      if (["video", "audio", "document", "assignment"].includes(contentType)) {
        const typedContent = currentContent as {
          title?: string;
          description?: string;
          fileUrl?: string;
          fileName?: string;
          fileSize?: number;
          fileType?: string;
          publicId?: string;
          resourceType?: string;
          embedUrl?: string;
        };

        if (typedContent.title) saveData.title = typedContent.title;
        if (typedContent.description)
          saveData.description = typedContent.description;

        if (contentType === "video" && typedContent.embedUrl) {
          saveData.embedUrl = typedContent.embedUrl;
        } else if (typedContent.fileUrl) {
          saveData.url = typedContent.fileUrl;
          saveData.filename = typedContent.fileName;
          saveData.size = typedContent.fileSize;
          saveData.mimeType = typedContent.fileType;
          saveData.metadata = {
            publicId: typedContent.publicId,
            resourceType: typedContent.resourceType,
          };
        }
      }

      if (contentType === "quiz") {
        const typedContent = currentContent as {
          data?: { quizId?: string };
          title?: string;
        };
        if (typedContent.data?.quizId) {
          saveData.quizId = typedContent.data.quizId;
        }
        if (typedContent.title) {
          saveData.title = typedContent.title;
        }
      }

      let contentTitle = lessonTitle;
      if (["video", "audio", "document", "assignment"].includes(contentType)) {
        const typedContent = currentContent as { title?: string };
        contentTitle = typedContent.title || lessonTitle;
      }

      if (isEditMode && contentId) {
        await updateContent({
          courseId,
          lessonId,
          contentId,
          data: {
            title: contentTitle,
            type:
              (contentType === "blocks"
                ? "block"
                : (contentType as
                    | "text"
                    | "video"
                    | "document"
                    | "quiz"
                    | "assignment"
                    | "audio")) || "text",
            data: saveData,
          },
        }).unwrap();

        showSuccessToast("Content updated successfully!");
      } else {
        await createContent({
          courseId,
          lessonId,
          data: {
            title: contentTitle,
            type:
              (contentType === "blocks"
                ? "block"
                : (contentType as
                    | "text"
                    | "video"
                    | "document"
                    | "quiz"
                    | "assignment"
                    | "audio")) || "text",
            data: saveData,
          },
        }).unwrap();

        showSuccessToast("Content saved successfully!");
      }

      setIsUploading(false);
      setUploadProgress("");

      router.push(`/courses/create/${courseId}`);
    } catch (error) {
      console.error("Error saving content:", error);
      setIsUploading(false);
      setUploadProgress("");
      showErrorToast("Failed to save content");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    // State
    courseId,
    lessonId,
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
  };
}
