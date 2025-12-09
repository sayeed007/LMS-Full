"use client";

interface UploadLoaderProps {
  isOpen: boolean;
  uploadProgress?: string;
  title?: string;
  description?: string;
}

export function UploadLoader({
  isOpen,
  uploadProgress,
  title = "Processing...",
  description = "Please wait while we process your request"
}: UploadLoaderProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {uploadProgress || description}
        </p>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full animate-pulse w-full"></div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Please don&apos;t close or refresh this page
        </p>
      </div>
    </div>
  );
}
