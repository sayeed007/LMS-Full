"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import BlockTextEditor from "./BlockTextEditor";
import { BlockTypeSelector } from "./BlockTypeSelector";
import MediaContentEditor from "./MediaContentEditor";
import VideoContentEditor from "./VideoContentEditor";

interface ContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "document";
  content: string | { url?: string; text?: string; [key: string]: unknown };
  order: number;
  title?: string;
  description?: string;
  textContent?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  publicId?: string;
  resourceType?: string;
  embedUrl?: string;
  videoType?: "upload" | "embed";
}

interface LessonContent {
  type: "text" | "blocks" | "video" | "document" | "quiz" | "assignment";
  blocks?: ContentBlock[];
  textContent?: string;
  title?: string;
  description?: string;
  data?: { quizId?: string };
}

interface BlocksContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
  selectedFiles: { [blockId: string]: File | null };
  filePreviewUrls: { [blockId: string]: string | null };
  onFileSelect: (blockId: string, file: File) => void;
  onFileRemove: (blockId: string) => void;
  isUploading: boolean;
}

export default function BlocksContentEditor({
  content,
  onChange,
  selectedFiles,
  filePreviewUrls,
  onFileSelect,
  onFileRemove,
  isUploading,
}: BlocksContentEditorProps) {
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set((content.blocks || []).map((b) => b.id)) // All blocks expanded by default
  );

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      order: (content.blocks || []).length + 1,
      title: "",
      description: "",
      textContent: "",
    };

    onChange({
      ...content,
      blocks: [...(content.blocks || []), newBlock],
    });

    // Expand the new block
    setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
    setShowBlockTypeSelector(false);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...(content.blocks || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [
        newBlocks[targetIndex],
        newBlocks[index],
      ];

      // Update order
      newBlocks.forEach((block, idx) => {
        block.order = idx + 1;
      });

      onChange({ ...content, blocks: newBlocks });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-8">
          Add content to your blocks
        </h2>
      </div>

      {/* Content Blocks */}
      {(content.blocks || []).map((block, index) => (
        <ContentBlockRenderer
          key={block.id}
          block={block}
          index={index}
          totalBlocks={(content.blocks || []).length}
          isExpanded={expandedBlocks.has(block.id)}
          onToggleExpand={() => toggleBlockExpansion(block.id)}
          onChange={(updatedBlock) => {
            const updatedBlocks = [...(content.blocks || [])];
            updatedBlocks[index] = updatedBlock;
            onChange({ ...content, blocks: updatedBlocks });
          }}
          onDelete={() => {
            const updatedBlocks = (content.blocks || []).filter(
              (b) => b.id !== block.id
            );
            onChange({ ...content, blocks: updatedBlocks });
          }}
          onMove={(direction) => moveBlock(index, direction)}
          selectedFile={selectedFiles[block.id] || null}
          filePreviewUrl={filePreviewUrls[block.id] || null}
          onFileSelect={(file: File) => onFileSelect(block.id, file)}
          onFileRemove={() => onFileRemove(block.id)}
          isUploading={isUploading}
        />
      ))}

      {/* Add Content Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
        <Button
          onClick={() => setShowBlockTypeSelector(!showBlockTypeSelector)}
          className="bg-black text-white hover:bg-gray-800"
        >
          + Add Content
        </Button>

        {/* Block Type Selector */}
        <BlockTypeSelector
          isOpen={showBlockTypeSelector}
          onSelect={addContentBlock}
          onClose={() => setShowBlockTypeSelector(false)}
        />
      </div>
    </div>
  );
}

// Content Block Renderer
function ContentBlockRenderer({
  block,
  index,
  totalBlocks,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onMove,
  selectedFile,
  filePreviewUrl,
  onFileSelect,
  onFileRemove,
  isUploading,
}: {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  selectedFile: File | null;
  filePreviewUrl: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  isUploading: boolean;
}) {
  const updateBlockContent = (field: string, value: string) => {
    onChange({
      ...block,
      [field]: value,
    });
  };

  const renderBlockEditor = () => {
    switch (block.type) {
      case "text":
        return (
          <div className="space-y-4">
            <Input
              value={block.title || ""}
              onChange={(e) => updateBlockContent("title", e.target.value)}
              placeholder="Block title"
              className="font-medium"
            />
            <BlockTextEditor
              content={{
                type: "text",
                blocks: [],
                textContent: block.textContent,
                title: block.title,
                description: block.description,
              }}
              onChange={(textContent) => {
                onChange({
                  ...block,
                  textContent: textContent.textContent,
                  title: block.title, // Keep the block title separate from content title
                  description: block.description,
                });
              }}
            />
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <VideoContentEditor
              content={{
                type: block.type as "video",
                blocks: [],
                title: block.title,
                description: block.description,
                textContent: block.textContent,
                fileUrl: block.fileUrl,
                fileName: block.fileName,
                fileSize: block.fileSize,
                fileType: block.fileType,
                publicId: block.publicId,
                resourceType: block.resourceType,
                embedUrl: block.embedUrl,
                videoType: block.videoType,
              }}
              onChange={(videoContent) => {
                onChange({
                  ...block,
                  title: videoContent.title,
                  description: videoContent.description,
                  fileUrl: videoContent.fileUrl,
                  fileName: videoContent.fileName,
                  fileSize: videoContent.fileSize,
                  fileType: videoContent.fileType,
                  publicId: videoContent.publicId,
                  resourceType: videoContent.resourceType,
                  embedUrl: videoContent.embedUrl,
                  videoType: videoContent.videoType,
                });
              }}
              selectedFile={selectedFile}
              filePreviewUrl={filePreviewUrl}
              onFileSelect={onFileSelect}
              onFileRemove={onFileRemove}
              isUploading={isUploading}
            />
          </div>
        );

      case "image":
      case "audio":
      case "document":
        return (
          <div className="space-y-4">
            <MediaContentEditor
              content={{
                type: "document" as
                  | "text"
                  | "document"
                  | "video"
                  | "quiz"
                  | "assignment"
                  | "blocks",
                blocks: [],
                title: block.title || "",
                description: block.description || "",
                textContent: block.textContent,
                fileUrl: block.fileUrl,
                fileName: block.fileName,
                fileSize: block.fileSize,
                fileType: block.fileType,
                publicId: block.publicId,
                resourceType: block.resourceType,
              }}
              onChange={(mediaContent) => {
                onChange({
                  ...block,
                  title: mediaContent.title,
                  description: mediaContent.description,
                  fileUrl: mediaContent.fileUrl,
                  fileName: mediaContent.fileName,
                  fileSize: mediaContent.fileSize,
                  fileType: mediaContent.fileType,
                  publicId: mediaContent.publicId,
                  resourceType: mediaContent.resourceType,
                });
              }}
              contentType={block.type}
              selectedFile={selectedFile}
              filePreviewUrl={filePreviewUrl}
              onFileSelect={onFileSelect}
              onFileRemove={onFileRemove}
              isUploading={isUploading}
            />
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-center py-8">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Block Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <span className="font-medium capitalize text-gray-700">
              {block.type} Block
            </span>
          </div>
          <span className="text-sm text-gray-500">#{block.order}</span>
          {block.title && !isExpanded && (
            <span className="text-sm text-gray-600 truncate max-w-xs">
              - {block.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 w-8 p-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Move buttons */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMove("up")}
              disabled={index === 0}
              className="h-8 w-8 p-0"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMove("down")}
              disabled={index === totalBlocks - 1}
              className="h-8 w-8 p-0"
            >
              ↓
            </Button>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Block Content Editor - Only show when expanded */}
      {isExpanded && <div className="mt-4">{renderBlockEditor()}</div>}
    </div>
  );
}
