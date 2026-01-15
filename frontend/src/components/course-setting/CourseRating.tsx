import { Button } from "@/components/ui/button";
import React from "react";

interface CourseRatingProps {
  ratingEnabled: boolean;
  setRatingEnabled: (value: boolean) => void;
}

export function CourseRating({
  ratingEnabled,
  setRatingEnabled,
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
        <Button className="bg-blue-600 text-white">Save</Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
