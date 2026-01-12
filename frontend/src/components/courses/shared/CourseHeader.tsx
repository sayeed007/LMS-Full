import { AvatarWithDate } from "@/components/ui/AvatarWithDate";
import { Badge } from "@/components/ui/badge";
import { CoursePopulated } from "@/store/api/courseApi";
import { CourseChapter } from "@/types/backend-models";
import { BookOpen, Clock } from "lucide-react";

interface CourseHeaderProps {
  course: Partial<CoursePopulated>;
  chapters: CourseChapter[];
  totalLessons: number;
  actionButtons?: React.ReactNode;
}

export function CourseHeader({
  course,
  chapters,
  totalLessons,
  actionButtons,
}: CourseHeaderProps) {
  return (
    <div className="flex-3">
      {/* Rating and Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-3xl text-sm font-medium">
          <span className="text-orange-600">★</span>
          <span className="text-white">
            {course.rating?.average?.toFixed(1) || "4.5"}
          </span>
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-4">
        {course.title || "Database for Software Developers"}
      </h1>

      {/* Author Info */}
      <AvatarWithDate
        name={course.instructor?.name}
        avatar={course.instructor?.avatar}
        date={course.createdAt || ""}
        size="lg"
        className="mb-4"
      />

      {/* Description */}
      <div className="space-y-4 mb-4">
        <p className="text-gray-700 leading-relaxed line-clamp-2">
          {course.description || ""}
        </p>
        <button className="text-blue-600 font-medium hover:underline">
          Read More
        </button>
      </div>

      {/* Course Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>
            {chapters?.length || 0} Chapter
            {(chapters?.length || 0) !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-gray-400">|</span>
        <div className="flex items-center gap-2">
          <span>
            {totalLessons || 0} Lesson{totalLessons !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-gray-400">|</span>
        <div className="flex items-center gap-2">
          <span>{course.stats?.totalQuizzes || 0} Quiz&apos;s</span>
        </div>
        <span className="text-gray-400">|</span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{course.duration || 0} Hours</span>
        </div>
        <span className="text-gray-400">|</span>
        <Badge className="bg-green-100 text-green-800 border-green-200 capitalize">
          {course.level || "Advanced"}
        </Badge>
      </div>

      {/* Action Buttons */}
      {actionButtons}
    </div>
  );
}
