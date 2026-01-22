import { Button } from "@/components/ui/button";
import { useUploadFileToCloudinaryMutation } from "@/store/api/uploadApi";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface CourseBrandingProps {
  thumbnail: string | null;
  setThumbnail: (value: string | null) => void;
  onSave: (url: string | null) => void;
  isLoading?: boolean;
}

export function CourseBranding({
  thumbnail,
  setThumbnail,
  onSave,
  isLoading,
}: CourseBrandingProps) {
  const [uploadFileToCloudinary, { isLoading: isUploading }] =
    useUploadFileToCloudinaryMutation();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB");
      return;
    }

    setLocalFile(file);
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    // Don't set main thumbnail state until saved/uploaded

    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setThumbnail(null);
    setLocalFile(null);
    setLocalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      let finalUrl = thumbnail;

      // If there's a new file selected, upload it first
      if (localFile) {
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("upload_preset", "lms_course_thumbnails"); // Assuming preset exists, or backend handles it
        // Note: backend endpoint expects 'file' field

        const response = await uploadFileToCloudinary(formData).unwrap();
        if (response?.data?.url) {
          finalUrl = response.data.url;
          setThumbnail(finalUrl);
          setLocalFile(null);
          setLocalPreview(null);
        } else {
          throw new Error("Upload failed");
        }
      } else if (localPreview === null && thumbnail === null) {
        // Explicit removal
        finalUrl = null;
      }

      onSave(finalUrl);
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
  };

  const displayImage = localPreview || thumbnail;
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Reset loading state when image source changes
  React.useEffect(() => {
    if (displayImage) {
      setIsImageLoading(true);
    }
  }, [displayImage]);

  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-sm font-semibold mb-3">Thumbnail</p>
      <div className="flex items-start gap-6">
        <div className="w-56 h-36 overflow-hidden rounded-xl border border-gray-200 bg-black/5 relative group">
          {displayImage ? (
            <>
              <Image
                key={displayImage}
                src={displayImage}
                alt="thumb"
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                className={`object-cover transition-opacity duration-300 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsImageLoading(false)}
                priority
              />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
            >
              Choose Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {displayImage && (
              <button
                onClick={handleRemove}
                className="text-gray-700 hover:text-red-600 text-sm"
                disabled={isUploading || isLoading}
              >
                Remove
              </button>
            )}
          </div>

          <Button
            onClick={handleSave}
            className="bg-blue-600 text-white w-fit"
            disabled={isUploading || isLoading}
          >
            {(isUploading || isLoading) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">Size limit: 5 MB</div>
    </div>
  );
}
