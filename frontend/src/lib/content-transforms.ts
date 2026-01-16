/**
 * Content Transforms
 * Transform functions for converting between frontend and backend content formats
 */

import { decodeHTMLEntities } from "./html-utils";
import type { ContentBlock, BackendBlock, BackendBlockForSave } from "@/types/content-editor";

/**
 * Transform backend block format to frontend format
 */
export const transformBlockFromBackend = (
    backendBlock: BackendBlock
): ContentBlock => {
    // Get the text content and decode HTML entities if present
    const rawTextContent =
        backendBlock.data?.text || backendBlock.textContent || "";
    const decodedTextContent = rawTextContent
        ? decodeHTMLEntities(rawTextContent)
        : "";

    // Extract metadata (publicId and resourceType) from nested data.metadata
    const publicId =
        backendBlock.data?.metadata?.publicId || backendBlock.publicId;
    const resourceType =
        backendBlock.data?.metadata?.resourceType || backendBlock.resourceType;

    // Get URL from data - could be file URL or embed URL
    const dataUrl = backendBlock.data?.url || "";

    // Detect if URL is an embed URL (YouTube, Vimeo, or embed path)
    const isEmbedUrl = dataUrl && (
        dataUrl.includes("youtube.com/embed") ||
        dataUrl.includes("youtu.be") ||
        dataUrl.includes("youtube.com/watch") ||
        dataUrl.includes("vimeo.com") ||
        dataUrl.includes("player.vimeo.com")
    );

    // For video blocks, determine if it's embed or upload based on URL pattern
    const fileUrl = isEmbedUrl ? backendBlock.fileUrl : (dataUrl || backendBlock.fileUrl);
    const embedUrl = isEmbedUrl
        ? dataUrl
        : (backendBlock.data?.embedUrl || backendBlock.embedUrl);
    const videoType = isEmbedUrl ? "embed" : backendBlock.videoType;

    const transformed = {
        id: backendBlock._id || backendBlock.id || `block-${Date.now()}`,
        type: backendBlock.type,
        content: backendBlock.data || backendBlock.content || {},
        order: backendBlock.order,
        title: backendBlock.data?.title || backendBlock.title || "",
        description:
            backendBlock.data?.description || backendBlock.description || "",
        textContent: decodedTextContent,
        fileUrl: fileUrl,
        fileName: backendBlock.data?.filename || backendBlock.fileName,
        fileSize: backendBlock.data?.size || backendBlock.fileSize,
        fileType: backendBlock.data?.mimeType || backendBlock.fileType,
        publicId: publicId,
        resourceType: resourceType,
        embedUrl: embedUrl,
        videoType: videoType,
    } as ContentBlock;

    return transformed;
};

/**
 * Transform frontend block format to backend format
 */
export const transformBlockToBackend = (
    frontendBlock: ContentBlock
): BackendBlockForSave => {
    return {
        type: frontendBlock.type,
        order: frontendBlock.order,
        data: {
            text: frontendBlock.textContent || "",
            title: frontendBlock.title || "",
            description: frontendBlock.description || "",
            url: frontendBlock.fileUrl,
            filename: frontendBlock.fileName,
            size: frontendBlock.fileSize,
            mimeType: frontendBlock.fileType,
            embedUrl: frontendBlock.embedUrl,
            metadata: {
                publicId: frontendBlock.publicId,
                resourceType: frontendBlock.resourceType,
            },
        },
    };
};
