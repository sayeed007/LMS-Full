import { Skeleton } from "@/components/ui/skeleton";

export function CourseOutlineSkeleton() {
  return (
    <div className="space-y-4">
      {/* Chapter Skeleton */}
      {[1, 2].map((i) => (
        <div
          key={`chapter-${i}`}
          className="bg-blue-50/50 border border-blue-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm" /> {/* Chevron */}
              <Skeleton className="h-4 w-4 rounded-sm" /> {/* Icon */}
              <Skeleton className="h-6 w-48" /> {/* Title */}
              <Skeleton className="h-5 w-24 rounded-full" /> {/* Badge */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" /> {/* Add Lesson */}
              <Skeleton className="h-8 w-8" /> {/* Settings */}
              <Skeleton className="h-8 w-8" /> {/* Delete */}
            </div>
          </div>
          {/* Nested Lessons */}
          <div className="space-y-2 ml-6">
            <Skeleton className="h-12 w-full rounded-md bg-white" />
            <Skeleton className="h-12 w-full rounded-md bg-white" />
          </div>
        </div>
      ))}

      {/* Standalone Lessons Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}
