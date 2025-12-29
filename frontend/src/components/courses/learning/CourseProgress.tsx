"use client";

import { cn } from "@/lib/utils";

interface CourseProgressProps {
  totalLessons: number;
  completedLessons: number;
  className?: string;
}

export function CourseProgress({ totalLessons, completedLessons, className }: CourseProgressProps) {
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white">Course Progress</span>
        <span className="text-white">
          {completedLessons} of {totalLessons} lessons
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-between text-xs text-white">
        <span>{Math.round(progressPercentage)}% Complete</span>
        {progressPercentage === 100 && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            ✓ Completed
          </span>
        )}
      </div>
    </div>
  );
}