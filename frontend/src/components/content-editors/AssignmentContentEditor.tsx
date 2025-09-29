"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, Download } from "lucide-react";

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: Array<{ id: string; type: string; content: unknown; order: number }>;
  textContent?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  publicId?: string;
  resourceType?: string;
}

interface AssignmentContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  isUploading: boolean;
}

export default function AssignmentContentEditor({
  content,
  onChange,
  selectedFile,
  onFileSelect,
  onFileRemove,
  isUploading
}: AssignmentContentEditorProps) {
  const getAcceptedFileTypes = () => {
    return '.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);

    // Clear the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          value={content.title || ""}
          onChange={(e) => onChange({
            ...content,
            title: e.target.value
          })}
          placeholder="Add Assignment Title"
          className="text-lg"
        />
      </div>

      <div>
        <textarea
          value={content.description || ""}
          onChange={(e) => onChange({
            ...content,
            description: e.target.value
          })}
          placeholder="Add Assignment Description and Instructions"
          className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] resize-none"
        />
      </div>

      {/* File Upload/Preview Area */}
      {!content.fileUrl && !selectedFile ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-blue-600 mb-4 text-4xl">
            📄
          </div>
          <h3 className="font-semibold mb-2">Upload Assignment File</h3>
          <p className="text-gray-600 text-sm mb-4">
            Choose a document file from your device (PDF, DOC, PPT, TXT, XLS).
          </p>
          <input
            type="file"
            accept={getAcceptedFileTypes()}
            className="hidden"
            id="assignment-upload"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          <label
            htmlFor="assignment-upload"
            className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
              isUploading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Processing...' : 'Select Assignment File'}
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
              <div className="text-amber-600 text-2xl">
                📄
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{content.fileName}</h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(content.fileSize || 0)} • {content.fileType}
                </p>
                <p className="text-sm text-amber-600 font-medium">File selected - will upload when saved</p>
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

          {/* Assignment File Preview */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-center py-8 space-x-4">
              <FileText className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-gray-600 mb-2">Assignment File Ready for Upload</p>
                <p className="text-sm text-gray-500">Preview will be available after saving</p>
              </div>
            </div>
          </div>

          {/* Replace File Button */}
          <div className="mt-4 text-center">
            <input
              type="file"
              accept={getAcceptedFileTypes()}
              className="hidden"
              id="assignment-replace-selected"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            <label
              htmlFor="assignment-replace-selected"
              className={`inline-block px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                isUploading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isUploading ? 'Processing...' : 'Replace File'}
            </label>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 text-2xl">
                📄
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{content.fileName}</h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(content.fileSize || 0)} • {content.fileType}
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

          {/* Uploaded File Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center py-8 space-x-4">
              <FileText className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-gray-600 mb-2">Assignment Document</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(content.fileUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Assignment
                </Button>
              </div>
            </div>
          </div>

          {/* Replace File Button */}
          <div className="mt-4 text-center">
            <input
              type="file"
              accept={getAcceptedFileTypes()}
              className="hidden"
              id="assignment-replace"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            <label
              htmlFor="assignment-replace"
              className={`inline-block px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                isUploading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isUploading ? 'Processing...' : 'Replace File'}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}