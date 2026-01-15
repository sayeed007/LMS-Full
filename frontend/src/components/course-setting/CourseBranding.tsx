import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

interface CourseBrandingProps {
  thumbnail: string | null;
  setThumbnail: (value: string | null) => void;
}

export function CourseBranding({
  thumbnail,
  setThumbnail,
}: CourseBrandingProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-sm font-semibold mb-3">Thumbnail</p>
      <div className="flex items-start gap-6">
        <div className="w-56 h-36 overflow-hidden rounded-xl border border-gray-200 bg-black/5">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt="thumb"
              width={224}
              height={144}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => document.getElementById("thumbInput")?.click()}
            className="bg-blue-600 text-white"
          >
            Change Thumbnail
          </Button>
          <input
            id="thumbInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setThumbnail(url);
            }}
          />
          <button onClick={() => setThumbnail(null)} className="text-gray-700">
            Remove
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">Size limit: 5 MB</div>
    </div>
  );
}
