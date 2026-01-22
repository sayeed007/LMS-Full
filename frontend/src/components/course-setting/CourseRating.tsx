import { Button } from "@/components/ui/button";
import React from "react";

interface CourseRatingProps {
  ratingEnabled: boolean;
  setRatingEnabled: (value: boolean) => void;
  onSave: () => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

export function CourseRating({
  ratingEnabled,
  setRatingEnabled,
  onSave,
  isLoading,
}: CourseRatingProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <label className="inline-flex items-center gap-3">
        <input
          type="checkbox"
          className="accent-indigo-600"
          checked={ratingEnabled}
          onChange={(e) => setRatingEnabled(e.target.checked)}
        />
        <span>Allow learners to rate this course</span>
      </label>
      <div className="flex items-center gap-4 mt-6">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-600 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
