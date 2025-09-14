import { CourseDetails } from "@/types";
import Image from "next/image";
import React from "react";



export function CourseCard({ course }: { course: CourseDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 hover:shadow-lg transition cursor-pointer">
      <div className="h-32 w-full flex items-center justify-center mb-2">
        {/* Replace with real image if available */}
        <Image
          src={course.image}
          alt={course.name}
          width={250}
          height={140}
          className="h-24 w-24 object-contain"
        />
      </div>
      <div className="flex-1">
        <div className="text-lg font-bold text-dark mb-1 flex items-center gap-2">
          {course.name}
        </div>
        <div className="text-info text-xs font-semibold mb-2">
          {course.category}
        </div>
        <div className="text-grey-2 text-sm mb-2 line-clamp-2">
          {course.description}
        </div>
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="bg-off-white-4 text-dark px-2 py-1 rounded">
            {course.difficulty}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-grey-2 mt-2">
        <span>📁 {course.chapters} Chapter</span>
        <span>📄 {course.lessons} Lesson</span>
        <span>❓ {course.quizzes} Quiz</span>
      </div>
    </div>
  );
}
