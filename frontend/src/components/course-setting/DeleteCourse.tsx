import { Button } from "@/components/ui/button";
import React from "react";

interface DeleteCourseProps {
  onDelete: () => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

export function DeleteCourse({ onDelete, isLoading }: DeleteCourseProps) {
  return (
    <div className="px-4 pb-5 pt-2">
      <p className="text-sm text-gray-600 mb-4">
        This action is permanent. Please confirm.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={onDelete}
          disabled={isLoading}
          className="bg-rose-600 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Delete Course
        </Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
