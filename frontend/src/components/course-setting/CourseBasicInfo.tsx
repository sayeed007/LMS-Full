import { Button } from "@/components/ui/button";
import React from "react";

interface CourseBasicInfoProps {
  courseName: string;
  setCourseName: (value: string) => void;
  courseDesc: string;
  setCourseDesc: (value: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function CourseBasicInfo({
  courseName,
  setCourseName,
  courseDesc,
  setCourseDesc,
  onSave,
  isLoading,
}: CourseBasicInfoProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course Name</label>
          <input
            className="w-full h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Name here"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={5}
            className="w-full rounded-md border border-gray-200 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Description here"
            value={courseDesc || ""}
            onChange={(e) => setCourseDesc(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            Character Limit {courseDesc?.length || 0}/5000
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-6">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-600 text-white"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
