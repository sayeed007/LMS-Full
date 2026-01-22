import { Button } from "@/components/ui/button";
import React from "react";

import { Loader2 } from "lucide-react";

interface CourseCertificatesProps {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function CourseCertificates({
  enabled,
  setEnabled,
  onSave,
  isLoading,
}: CourseCertificatesProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="accent-indigo-600"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>Enable Course Certificate</span>
        </label>
      </div>
      <Button
        onClick={onSave}
        disabled={isLoading}
        className="bg-blue-600 text-white"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Save
      </Button>
      <button className="ml-4 text-gray-600">Cancel</button>
    </div>
  );
}
