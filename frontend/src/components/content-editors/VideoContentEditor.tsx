"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Upload, X } from "lucide-react";
import { useState } from "react";

interface LessonContent {
  type: "text" | "blocks" | "video" | "document" | "quiz" | "assignment";
  blocks?: Array<{ id: string; type: string; content: unknown; order: number }>;
  textContent?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  publicId?: string;
  resourceType?: string;
  embedUrl?: string;
  videoType?: "upload" | "embed";
  data?: { quizId?: string };
}

interface VideoContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
  selectedFile: File | null;
  filePreviewUrl: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  isUploading: boolean;
}

export default function VideoContentEditor({
  content,
  onChange,
  selectedFile,
  filePreviewUrl,
  onFileSelect,
  onFileRemove,
  isUploading,
}: VideoContentEditorProps) {
  const [videoType, setVideoType] = useState<"upload" | "embed">(
    content.videoType || "upload"
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);

    // Clear the input value so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleVideoTypeChange = (type: "upload" | "embed") => {
    setVideoType(type);
    onChange({
      ...content,
      videoType: type,
      // Clear opposite type data
      ...(type === "upload"
        ? { embedUrl: "" }
        : {
            fileUrl: "",
            fileName: "",
            fileSize: 0,
            fileType: "",
            publicId: "",
            resourceType: "",
          }),
    });

    // If switching to upload and there's a selected file, keep it
    // If switching to embed, remove any selected file
    if (type === "embed" && selectedFile) {
      onFileRemove();
    }
  };

  const extractVideoId = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { platform: "youtube", id: youtubeMatch[1] };
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { platform: "vimeo", id: vimeoMatch[1] };
    }

    return null;
  };

  const getEmbedUrl = (url: string) => {
    const videoInfo = extractVideoId(url);
    if (!videoInfo) return url;

    switch (videoInfo.platform) {
      case "youtube":
        return `https://www.youtube.com/embed/${videoInfo.id}`;
      case "vimeo":
        return `https://player.vimeo.com/video/${videoInfo.id}`;
      default:
        return url;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          value={content.title || ""}
          onChange={(e) =>
            onChange({
              ...content,
              title: e.target.value,
            })
          }
          placeholder="Add Video Title"
          className="text-lg"
        />
      </div>

      <div>
        <textarea
          value={content.description || ""}
          onChange={(e) =>
            onChange({
              ...content,
              description: e.target.value,
            })
          }
          placeholder="Add Video Description"
          className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] resize-none"
        />
      </div>

      {/* Video Type Selector */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <Button
          variant={videoType === "upload" ? "default" : "outline"}
          onClick={() => handleVideoTypeChange("upload")}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </Button>
        <Button
          variant={videoType === "embed" ? "default" : "outline"}
          onClick={() => handleVideoTypeChange("embed")}
          className="flex items-center gap-2"
        >
          <Link className="w-4 h-4" />
          Embed Video
        </Button>
      </div>

      {/* Upload Video Section */}
      {videoType === "upload" && (
        <>
          {!content.fileUrl && !selectedFile ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="text-blue-600 mb-4 text-4xl">🎥</div>
              <h3 className="font-semibold mb-2">Upload Video</h3>
              <p className="text-gray-600 text-sm mb-4">
                Choose a video file from your device.
              </p>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                id="video-upload"
                onChange={handleFileInputChange}
                disabled={isUploading}
              />
              <label
                htmlFor="video-upload"
                className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
                  isUploading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isUploading ? "Processing..." : "Select Video File"}
              </label>
              <p className="text-gray-500 text-xs mt-2">
                Maximum file upload size: 150 MB
              </p>
            </div>
          ) : selectedFile ? (
            /* Selected file preview (not yet uploaded) */
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-amber-600 text-2xl">🎥</div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {content.fileName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(content.fileSize || 0)} •{" "}
                      {content.fileType}
                    </p>
                    <p className="text-sm text-amber-600 font-medium">
                      File selected - will upload when saved
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Local File Preview */}
              <div className="bg-white rounded-lg p-4">
                {filePreviewUrl && (
                  <video
                    src={filePreviewUrl}
                    controls
                    className="w-full max-h-64 rounded"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Replace File Button */}
              <div className="mt-4 text-center">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-replace-selected"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                <label
                  htmlFor="video-replace-selected"
                  className={`inline-block px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    isUploading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isUploading ? "Processing..." : "Replace File"}
                </label>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 text-2xl">🎥</div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {content.fileName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(content.fileSize || 0)} •{" "}
                      {content.fileType}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* File Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <video
                  src={content.fileUrl}
                  controls
                  className="w-full max-h-64 rounded"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Replace File Button */}
              <div className="mt-4 text-center">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-replace"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                <label
                  htmlFor="video-replace"
                  className={`inline-block px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    isUploading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isUploading ? "Processing..." : "Replace File"}
                </label>
              </div>
            </div>
          )}
        </>
      )}

      {/* Embed Video Section */}
      {videoType === "embed" && (
        <div className="space-y-4">
          <div>
            <Input
              value={content.embedUrl || ""}
              onChange={(e) =>
                onChange({
                  ...content,
                  embedUrl: e.target.value,
                })
              }
              placeholder="Enter video URL (YouTube, Vimeo, or direct video link)"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: YouTube, Vimeo, or direct video file URLs
            </p>
          </div>

          {/* Embed Preview */}
          {content.embedUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Video Preview</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {extractVideoId(content.embedUrl) ? (
                  <iframe
                    src={getEmbedUrl(content.embedUrl)}
                    className="w-full h-64 rounded"
                    frameBorder="0"
                    allowFullScreen
                    title="Video Preview"
                  />
                ) : (
                  <video
                    src={content.embedUrl}
                    controls
                    className="w-full max-h-64 rounded"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
