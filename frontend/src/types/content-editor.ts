/**
 * Content Editor Types
 * Types for the course content editor components
 */

export interface ContentBlock {
    id: string;
    type: "text" | "image" | "video" | "audio" | "document";
    content: string | { url?: string; text?: string;[key: string]: unknown };
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
    videoType?: "embed" | "upload";
}

export interface LessonContent {
    type: "text" | "blocks" | "video" | "document" | "quiz" | "assignment";
    blocks?: ContentBlock[];
    textContent?: string;
    title?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    publicId?: string;
    resourceType?: string;
    data?: { quizId?: string };
    embedUrl?: string;
}

// Backend block type
export interface BackendBlock {
    _id?: string;
    id?: string;
    type: "text" | "image" | "video" | "audio" | "document";
    order: number;
    data?: {
        text?: string;
        title?: string;
        description?: string;
        url?: string;
        filename?: string;
        size?: number;
        mimeType?: string;
        embedUrl?: string;
        metadata?: {
            publicId?: string;
            resourceType?: string;
        };
    };
    content?: unknown;
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
    videoType?: "embed" | "upload";
}

// Backend format for saving
export interface BackendBlockForSave {
    type: "text" | "image" | "video" | "audio" | "document";
    order: number;
    data: {
        text?: string;
        title?: string;
        description?: string;
        url?: string;
        filename?: string;
        size?: number;
        mimeType?: string;
        embedUrl?: string;
        metadata?: {
            publicId?: string;
            resourceType?: string;
        };
    };
}

// Parsed data from backend
export interface ParsedContentData {
    textContent?: string;
    text?: string;
    title?: string;
    description?: string;
    url?: string;
    fileUrl?: string;
    filename?: string;
    fileName?: string;
    size?: number;
    fileSize?: number;
    mimeType?: string;
    fileType?: string;
    blocks?: BackendBlock[];
    items?: BackendBlock[]; // Backend may return blocks as "items"
    metadata?: {
        publicId?: string;
        resourceType?: string;
    };
    publicId?: string;
    resourceType?: string;
    quizId?: string;
}

// Content type options
export type ContentType = "text" | "blocks" | "block" | "video" | "audio" | "document" | "quiz" | "assignment";
