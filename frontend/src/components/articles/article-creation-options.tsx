// components/articles/article-creation-options.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnhancedSelect } from "@/components/ui/SearchableSelect";
import type { ArticleTemplate } from "@/constants/articleTemplates";
import { decodeHTMLEntities } from "@/lib/html-utils";
import {
  dismissToast,
  showAuthErrorToast,
  showFileUploadErrorToast,
  showFileUploadSuccessToast,
  showFileUploadToast,
  showFormErrorToast,
  showFormSuccessToast,
  showSaveLoadingToast,
  showSaveSuccessToast,
  showSuccessToast,
  showValidationErrorToast,
} from "@/lib/toast-utils";
import {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  type UpdateArticleRequest,
} from "@/store/api/articleApi";
import { useUploadFileToCloudinaryMutation } from "@/store/api/uploadApi";
import { Article } from "@/types/backend-models";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SimplePageContainer from "../layout/SimplePageContainer";
import { GoBackRoute } from "../reports/GoBackRoute";
import RichTextEditor from "../RichTextEditor";
import { Input } from "../ui/input";
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton";
import { MoreOptionsPopup } from "./article-more-option-popup";
import { ArticleAddThumbnailModal } from "./ArticleAddThumbnailModal";
import { ArticleAdvancedSettingModal } from "./ArticleAdvancedSettingModal";
import { ArticleTagsModal } from "./ArticleTagsModal";
import { FileImporter } from "./FileImporter";
import { TemplateSelector } from "./TemplateSelector";

interface ArticleCreationOptionsProps {
  existingArticle?: Article;
}

export function ArticleCreationOptions({
  existingArticle,
}: ArticleCreationOptionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Article state - Initialize with existingArticle data if provided
  const [articleId, setArticleId] = useState<string | null>(
    existingArticle?._id || null
  );
  const [articleName, setArticleName] = useState<string>(
    existingArticle?.title || searchParams.get("name") || "Untitled Article"
  );
  const [articleContent, setArticleContent] = useState(
    existingArticle?.content ? decodeHTMLEntities(existingArticle.content) : ""
  );
  const [articleCategory, setArticleCategory] = useState(
    existingArticle?.category || "General"
  );
  const [articleTags, setArticleTags] = useState<string[]>(
    existingArticle?.tags || []
  );
  const [articleThumbnail, setArticleThumbnail] = useState<string>(
    existingArticle?.thumbnail || ""
  );
  const [articleStatus, setArticleStatus] = useState<
    "draft" | "published" | "archived"
  >(existingArticle?.status || "draft");
  const [articleVisibility, setArticleVisibility] = useState<
    "public" | "private" | "organization"
  >(existingArticle?.visibility || "public");

  // Advanced settings state
  const [allowRating, setAllowRating] = useState<boolean>(
    existingArticle?.allowRating ?? true
  );
  const [allowComments, setAllowComments] = useState<boolean>(
    existingArticle?.allowComments ?? true
  );
  const [showViews, setShowViews] = useState<boolean>(
    existingArticle?.showViews ?? true
  );
  const [allowExport, setAllowExport] = useState<boolean>(
    existingArticle?.allowExport ?? true
  );

  // UI state
  const [showMorePopup, setShowMorePopup] = useState<boolean>(false);
  // If editing existing article, go straight to editor
  const [currentArticleWritingMethod, setCurrentArticleWritingMethod] =
    useState<"root" | "scratch" | "template" | "import">(
      existingArticle ? "scratch" : "root"
    );
  const [showAddThumbnailModal, setShowAddThumbnailModal] = useState(false);
  const [showAdvanceSettingModal, setShowAdvanceSettingModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showAutoSaveIntervalModal, setShowAutoSaveIntervalModal] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save settings
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(60); // Default 60 seconds
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number>(60);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [tempInterval, setTempInterval] = useState<string>("60");

  // Ref to track the last saved content snapshot
  const lastSavedSnapshot = useRef({
    name: existingArticle?.title || "",
    content: existingArticle?.content || "",
    category: existingArticle?.category || "General",
    tags: JSON.stringify(existingArticle?.tags || []),
    thumbnail: existingArticle?.thumbnail || "",
    visibility: existingArticle?.visibility || "public",
  });

  // API hooks
  const [createArticle] = useCreateArticleMutation();
  const [updateArticle] = useUpdateArticleMutation();
  const [uploadFile] = useUploadFileToCloudinaryMutation();
  // const { data: categoriesData } = useGetArticleCategoriesQuery();

  // Effect to populate form when existingArticle is provided or changes
  useEffect(() => {
    if (existingArticle) {
      const decodedContent = existingArticle.content
        ? decodeHTMLEntities(existingArticle.content)
        : "";

      setArticleId(existingArticle._id);
      setArticleName(existingArticle.title);
      // Decode HTML entities for proper display in editor
      setArticleContent(decodedContent);
      setArticleCategory(existingArticle.category);
      setArticleTags(existingArticle.tags);
      setArticleThumbnail(existingArticle.thumbnail || "");
      setArticleStatus(existingArticle.status);
      setArticleVisibility(existingArticle.visibility);

      // Advanced settings
      setAllowRating(existingArticle.allowRating ?? true);
      setAllowComments(existingArticle.allowComments ?? true);
      setShowViews(existingArticle.showViews ?? true);
      setAllowExport(existingArticle.allowExport ?? true);

      setCurrentArticleWritingMethod("scratch");

      // Update the last saved snapshot to match loaded article
      lastSavedSnapshot.current = {
        name: existingArticle.title,
        content: decodedContent,
        category: existingArticle.category,
        tags: JSON.stringify(existingArticle.tags),
        thumbnail: existingArticle.thumbnail || "",
        visibility: existingArticle.visibility,
      };

      // Reset unsaved changes since we just loaded saved content
      setHasUnsavedChanges(false);
    }
  }, [existingArticle]);

  // Create or update article
  const saveArticle = async (status: "draft" | "published" = "draft") => {
    // Validation
    if (!session) {
      showAuthErrorToast("You must be logged in to save articles");
      return;
    }

    if (!articleName.trim()) {
      showValidationErrorToast("Article Title");
      return;
    }

    if (status === "published" && !articleContent.trim()) {
      showValidationErrorToast("Article Content");
      return;
    }

    setIsLoading(true);
    const loadingToastId = showSaveLoadingToast();

    try {
      const articleData = {
        title: articleName.trim(),
        content: articleContent,
        excerpt: articleContent
          ? articleContent.substring(0, 150).replace(/<[^>]*>/g, "") + "..."
          : "",
        category: articleCategory,
        tags: articleTags,
        thumbnail: articleThumbnail,
        status,
        visibility: articleVisibility,
        allowRating,
        allowComments,
        showViews,
        allowExport,
      };

      if (articleId) {
        // Update existing article
        const result = await updateArticle({
          id: articleId,
          data: articleData as UpdateArticleRequest,
        }).unwrap();
      } else {
        // Create new article
        const result = await createArticle(articleData).unwrap();
        setArticleId(result.data?.article._id || null);
      }

      // Reset unsaved changes flag after successful save
      setHasUnsavedChanges(false);

      // Update the last saved snapshot
      lastSavedSnapshot.current = {
        name: articleName.trim(),
        content: articleContent,
        category: articleCategory,
        tags: JSON.stringify(articleTags),
        thumbnail: articleThumbnail,
        visibility: articleVisibility,
      };

      // Update status after successful save
      setArticleStatus(status);

      dismissToast(loadingToastId);

      if (status === "published") {
        showFormSuccessToast(
          "Article published successfully! Your content is now live."
        );
        setTimeout(() => router.push("/articles"), 1500);
      } else {
        showSaveSuccessToast(
          "Article saved as draft! You can continue editing anytime."
        );
      }
    } catch (error) {
      const apiError = error as { data?: { message?: string } };
      dismissToast(loadingToastId);
      console.error("Error saving article:", error);

      const errorMessage =
        apiError?.data?.message || "Failed to save article. Please try again.";
      showFormErrorToast(errorMessage, () => saveArticle(status));
    }
    setIsLoading(false);
  };

  const handleStartFromScratch = () => {
    setCurrentArticleWritingMethod("scratch");
  };

  const handleReadyTemplate = () => {
    setCurrentArticleWritingMethod("template");
  };

  const handleImportFile = () => {
    setCurrentArticleWritingMethod("import");
  };

  const handleTemplateSelect = (template: ArticleTemplate) => {
    setArticleContent(template.content);
    setArticleCategory(template.category);
    setCurrentArticleWritingMethod("scratch");
    showSuccessToast(
      "Template loaded",
      `${template.name} template has been loaded. You can now edit it.`
    );
  };

  const handleFileImport = (content: string, fileName: string) => {
    setArticleContent(content);
    setCurrentArticleWritingMethod("scratch");
    showSuccessToast(
      "File imported",
      `Content from ${fileName} has been imported successfully.`
    );
  };

  const handleCancelTemplateOrImport = () => {
    setCurrentArticleWritingMethod("root");
  };

  const handlePublish = async () => {
    await saveArticle("published");
  };

  // More popup handlers
  const handleSaveAsDraft = async () => {
    await saveArticle("draft");
  };

  const handleMandatoryRead = () => {
    // Set article as mandatory read (could be a tag or special category)
    setArticleTags((prev) => [
      ...prev.filter((tag) => tag !== "mandatory"),
      "mandatory",
    ]);
    showSuccessToast(
      "Mandatory Read",
      "Article has been marked as mandatory reading for all users."
    );
  };

  const handleAddThumbnail = () => {
    setShowAddThumbnailModal(true);
  };

  const handleSaveThumbnail = async (file?: File, url?: string) => {
    if (file) {
      const uploadToastId = showFileUploadToast(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", "article-thumbnail");

        const uploadResult = await uploadFile(formData).unwrap();
        setArticleThumbnail(uploadResult.data?.url || "");

        dismissToast(uploadToastId);
        showFileUploadSuccessToast(file.name);
      } catch (error) {
        const apiError = error as { data?: { message?: string } };
        dismissToast(uploadToastId);
        console.error("Error uploading thumbnail:", error);

        const errorMessage =
          apiError?.data?.message ||
          "Failed to upload thumbnail. Please check file size and format.";
        showFileUploadErrorToast(errorMessage, () => handleSaveThumbnail(file));
      }
    } else if (url) {
      setArticleThumbnail(url);
      showSuccessToast(
        "Thumbnail updated",
        "Article thumbnail has been set successfully."
      );
    }
    setShowAddThumbnailModal(false);
  };

  const handleAdvancedSetting = () => {
    setShowAdvanceSettingModal(true);
  };

  const handleAdvancedSettingsSave = (settings: {
    rating: boolean;
    comments: boolean;
    views: boolean;
    exportEnabled: boolean;
  }) => {
    setAllowRating(settings.rating);
    setAllowComments(settings.comments);
    setShowViews(settings.views);
    setAllowExport(settings.exportEnabled);
    setShowAdvanceSettingModal(false);
  };

  const handleAutoSaveIntervalSave = () => {
    const interval = parseInt(tempInterval);
    if (!isNaN(interval) && interval >= 10) {
      setAutoSaveInterval(interval);
      setAutoSaveCountdown(interval);
      setShowAutoSaveIntervalModal(false);
      showSuccessToast(
        "Auto-save interval updated",
        `Auto-save will now occur every ${interval} seconds.`
      );
    } else {
      showValidationErrorToast(
        "Auto-save interval must be at least 10 seconds"
      );
    }
  };

  const handlePreview = () => {
    if (!articleName.trim()) {
      showValidationErrorToast("Article Title");
      return;
    }

    if (!articleContent.trim()) {
      showValidationErrorToast("Article Content");
      return;
    }

    // Calculate excerpt from content
    const excerpt = articleContent
      ? articleContent.substring(0, 150).replace(/<[^>]*>/g, "") + "..."
      : "";

    const params = new URLSearchParams();
    params.set("content", encodeURIComponent(articleContent));
    params.set("title", encodeURIComponent(articleName));
    params.set(
      "author",
      encodeURIComponent(session?.user?.name || "Anonymous")
    );
    params.set("category", encodeURIComponent(articleCategory));
    params.set("tags", encodeURIComponent(JSON.stringify(articleTags)));
    params.set("excerpt", encodeURIComponent(excerpt));
    params.set("thumbnail", encodeURIComponent(articleThumbnail));
    params.set("visibility", encodeURIComponent(articleVisibility));
    params.set("allowComments", allowComments.toString());
    params.set("allowRating", allowRating.toString());
    params.set("showViews", showViews.toString());
    params.set("allowExport", allowExport.toString());

    const url = `/articles/preview/${encodeURIComponent(
      articleName
    )}?${params.toString()}`;
    router.push(url);
  };

  // Track content changes to mark as unsaved and reset auto-save timer
  useEffect(() => {
    if (currentArticleWritingMethod === "scratch") {
      // Create current snapshot
      const currentSnapshot = {
        name: articleName,
        content: articleContent,
        category: articleCategory,
        tags: JSON.stringify(articleTags),
        thumbnail: articleThumbnail,
        visibility: articleVisibility,
      };

      // Compare with last saved snapshot
      const hasChanges =
        currentSnapshot.name !== lastSavedSnapshot.current.name ||
        currentSnapshot.content !== lastSavedSnapshot.current.content ||
        currentSnapshot.category !== lastSavedSnapshot.current.category ||
        currentSnapshot.tags !== lastSavedSnapshot.current.tags ||
        currentSnapshot.thumbnail !== lastSavedSnapshot.current.thumbnail ||
        currentSnapshot.visibility !== lastSavedSnapshot.current.visibility;

      if (hasChanges) {
        setHasUnsavedChanges(true);
        // Reset countdown when user makes changes to avoid interrupting their flow
        setAutoSaveCountdown(autoSaveInterval);
      } else {
        setHasUnsavedChanges(false);
      }
    }
  }, [
    articleContent,
    articleName,
    articleCategory,
    articleTags,
    articleThumbnail,
    articleVisibility,
    currentArticleWritingMethod,
    autoSaveInterval,
  ]);

  // Auto-save countdown timer (updates every second) - only when enabled
  useEffect(() => {
    if (
      isAutoSaveEnabled &&
      currentArticleWritingMethod === "scratch" &&
      articleContent.trim() &&
      articleName.trim() &&
      session &&
      !isLoading &&
      !isAutoSaving &&
      hasUnsavedChanges
    ) {
      const countdownInterval = setInterval(() => {
        setAutoSaveCountdown((prev) => {
          if (prev <= 1) {
            return 0; // Set to 0 to trigger save
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else if (!hasUnsavedChanges) {
      // Reset countdown if no unsaved changes
      setAutoSaveCountdown(autoSaveInterval);
    }
  }, [
    isAutoSaveEnabled,
    currentArticleWritingMethod,
    articleContent,
    articleName,
    session,
    isLoading,
    isAutoSaving,
    hasUnsavedChanges,
    autoSaveInterval,
  ]);

  // Auto-save functionality - triggers when countdown reaches 0 (only when enabled)
  useEffect(() => {
    if (
      isAutoSaveEnabled &&
      currentArticleWritingMethod === "scratch" &&
      articleContent.trim() &&
      articleName.trim() &&
      session &&
      !isLoading &&
      !isAutoSaving &&
      autoSaveCountdown === 0 && // Trigger when countdown hits 0
      hasUnsavedChanges
    ) {
      const performAutoSave = async () => {
        setIsAutoSaving(true);
        try {
          await saveArticle("draft");
          // Reset countdown after successful save
          setAutoSaveCountdown(autoSaveInterval);
        } catch (error) {
          console.error("Auto-save failed:", error);
          // Reset countdown even on error to prevent spam
          setAutoSaveCountdown(autoSaveInterval);
        } finally {
          setIsAutoSaving(false);
        }
      };

      performAutoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAutoSaveEnabled,
    autoSaveCountdown,
    currentArticleWritingMethod,
    session,
    hasUnsavedChanges,
    autoSaveInterval,
  ]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <SimplePageContainer containerSize="xl" containerPadding="none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-2">
          <GoBackRoute />
          <div className="relative flex items-center gap-2 flex-2">
            <Input
              value={articleName}
              onChange={(e) => {
                // Update URL with new name
                setArticleName(e.target.value);
                router.replace(
                  `/articles/create?name=${encodeURIComponent(e.target.value)}`
                );
              }}
              className="flex-1 text-lg pr-10 font-medium bg-transparent outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:border focus:border-gray-300"
            />
            <Image
              src="/icons/Cross.png"
              alt="Cross"
              width={16}
              height={16}
              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              onClick={() => {
                setArticleName("");
                router.replace(
                  `/articles/create?name=${encodeURIComponent("")}`
                );
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handlePublish();
            }}
            disabled={
              isLoading || !articleName.trim() || !articleContent.trim()
            }
            className="cursor-pointer bg-info text-white px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 transition disabled:opacity-50"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </Button>

          <PrimaryOutlineButton
            onClick={() => {
              handlePreview();
            }}
            disabled={
              isLoading || !articleName.trim() || !articleContent.trim()
            }
            className={isLoading ? "opacity-50" : ""}
          >
            Preview
          </PrimaryOutlineButton>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMorePopup((prev) => {
                  return !prev;
                });
              }}
              className="cursor-pointer bg-background text-info border-1 border-info px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 hover:text-white transition"
            >
              More
            </Button>

            <MoreOptionsPopup
              isOpen={showMorePopup}
              onClose={() => {
                setShowMorePopup(false);
              }}
              onSaveAsDraft={handleSaveAsDraft}
              onMandatoryRead={handleMandatoryRead}
              onAddThumbnail={handleAddThumbnail}
              onAdvancedSetting={handleAdvancedSetting}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}

      {currentArticleWritingMethod === "root" ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(80vh-80px)] px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Start creating your article
            </h1>
            <p className="text-gray-600">
              Create by your own or from ready template
            </p>
            {!session && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ You need to be logged in to save articles
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <Button
              variant="outline"
              className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
              onClick={handleStartFromScratch}
            >
              <Image
                src="/icons/StartFromScratch.png"
                alt="StartFromScratch"
                width={16}
                height={16}
              />
              <span className="text-info">Start from scratch</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
              onClick={handleReadyTemplate}
            >
              <Image
                src="/icons/ReadyTemplate.png"
                alt="ReadyTemplate"
                width={16}
                height={16}
              />
              <span className="text-info">Ready Template</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
              onClick={handleImportFile}
            >
              <Image
                src="/icons/ImportFile.png"
                alt="ImportFile"
                width={16}
                height={16}
              />
              <span className="text-info">Import File</span>
            </Button>
          </div>
        </div>
      ) : currentArticleWritingMethod === "template" ? (
        <div className="container mx-auto p-6 max-w-6xl">
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onCancel={handleCancelTemplateOrImport}
          />
        </div>
      ) : currentArticleWritingMethod === "import" ? (
        <div className="container mx-auto p-6 max-w-4xl">
          <FileImporter
            onImportContent={handleFileImport}
            onCancel={handleCancelTemplateOrImport}
          />
        </div>
      ) : currentArticleWritingMethod === "scratch" ? (
        <div className="container mx-auto p-6">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-semibold text-gray-900 px-2 py-1 rounded ${
                    articleStatus === "published"
                      ? "bg-green-100"
                      : articleStatus === "archived"
                      ? "bg-gray-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {articleStatus}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Category:</span>
                <EnhancedSelect
                  value={articleCategory}
                  onValueChange={(value) => value && setArticleCategory(value)}
                  placeholder="Select category"
                  clearable={false}
                  options={[
                    { value: "General", label: "General" },
                    { value: "Technology", label: "Technology" },
                    { value: "Education", label: "Education" },
                    { value: "Business", label: "Business" },
                    { value: "Science", label: "Science" },
                    { value: "Health", label: "Health" },
                    { value: "Entertainment", label: "Entertainment" },
                    { value: "Sports", label: "Sports" },
                    { value: "News", label: "News" },
                    { value: "Other", label: "Other" },
                  ]}
                  size="sm"
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Visibility:</span>
                <EnhancedSelect
                  value={articleVisibility}
                  onValueChange={(value) =>
                    value &&
                    setArticleVisibility(
                      value as "public" | "private" | "organization"
                    )
                  }
                  placeholder="Select visibility"
                  clearable={false}
                  options={[{ value: "public", label: "Public" }]}
                  size="sm"
                  className="w-32"
                />
              </div>

              {/* Tags button */}
              <button
                onClick={() => setShowTagsModal(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-300 rounded-md hover:bg-blue-50 transition"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Tags ({articleTags?.length})
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto-save toggle button */}
              <button
                onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isAutoSaveEnabled
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={
                  isAutoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"
                }
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isAutoSaveEnabled ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  )}
                </svg>
                <span>Auto-save</span>
                {isAutoSaveEnabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempInterval(autoSaveInterval.toString());
                      setShowAutoSaveIntervalModal(true);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-semibold"
                    title="Configure auto-save interval"
                  >
                    {autoSaveInterval}s
                  </button>
                )}
              </button>

              {/* Auto-save timer indicator */}
              {session &&
                isAutoSaveEnabled &&
                hasUnsavedChanges &&
                !isLoading &&
                !isAutoSaving &&
                autoSaveCountdown > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Saving in {autoSaveCountdown}s</span>
                  </div>
                )}
              {/* Saving indicator */}
              {(isLoading || isAutoSaving) && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  {isAutoSaving ? "Auto-saving..." : "Saving..."}
                </div>
              )}
              {/* Saved indicator */}
              {!hasUnsavedChanges &&
                !isLoading &&
                !isAutoSaving &&
                articleId && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>All changes saved</span>
                  </div>
                )}
            </div>
          </div>
          <RichTextEditor
            value={articleContent}
            onChange={setArticleContent}
            placeholder="Write something amazing..."
          />
        </div>
      ) : (
        <></>
      )}

      {/* Add Thumbnail Modal */}
      {showAddThumbnailModal && (
        <ArticleAddThumbnailModal
          open={showAddThumbnailModal}
          onOpenChange={setShowAddThumbnailModal}
          onSave={(file: File | null) => handleSaveThumbnail(file || undefined)}
        />
      )}

      {/* Advanced Settings Modal */}
      {showAdvanceSettingModal && (
        <ArticleAdvancedSettingModal
          open={showAdvanceSettingModal}
          onOpenChange={setShowAdvanceSettingModal}
          onSave={handleAdvancedSettingsSave}
          initial={{
            rating: allowRating,
            comments: allowComments,
            views: showViews,
            exportEnabled: allowExport,
          }}
        />
      )}

      {/* Tags Modal */}
      {showTagsModal && (
        <ArticleTagsModal
          open={showTagsModal}
          onOpenChange={setShowTagsModal}
          onSave={(tags) => setArticleTags(tags)}
          initialTags={articleTags}
        />
      )}

      {/* Auto-save Interval Modal */}
      {showAutoSaveIntervalModal && (
        <Dialog
          open={showAutoSaveIntervalModal}
          onOpenChange={setShowAutoSaveIntervalModal}
        >
          <DialogContent className="max-w-md w-full p-8">
            <DialogHeader className="border-b-2 border-gray-200 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Configure Auto-save Interval
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-6">
              <p className="text-sm text-gray-600">
                Set how often the editor should automatically save your work (in
                seconds).
              </p>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="intervalInput"
                  className="text-sm font-medium text-gray-700"
                >
                  Interval (seconds)
                </label>
                <Input
                  id="intervalInput"
                  type="number"
                  min="10"
                  value={tempInterval}
                  onChange={(e) => setTempInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter interval in seconds (min: 10)"
                />
                <p className="text-xs text-gray-500">
                  Minimum: 10 seconds. Recommended: 30-60 seconds.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <PrimaryOutlineButton
                onClick={() => setShowAutoSaveIntervalModal(false)}
              >
                Cancel
              </PrimaryOutlineButton>
              <Button
                onClick={handleAutoSaveIntervalSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SimplePageContainer>
  );
}
