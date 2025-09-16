"use client";

import { AddChapterModal } from "@/components/AddChapterModal";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarWithDate } from "@/components/ui/AvatarWithDate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetCourseByIdQuery } from "@/store/api/courseApi";
import { ChevronDown, ChevronRight, BookOpen, Clock, Users, BarChart3 } from "lucide-react";

// Fallback data structure for development/testing
const initialChapters = [
  { id: "c1", name: "Understanding DevOps & SDLC" },
  { id: "c2", name: "Version Control and CI/CD Basics" },
  { id: "c3", name: "Building CI/CD Pipelines (Module 3-4)" },
  { id: "c4", name: "CI/CD Pipeline Fundamentals" },
];

interface CourseDetailClientProps {
  courseId: string | null;
  error?: string | null;
}

export function CourseDetailClient({ courseId, error: propError }: CourseDetailClientProps) {
  // Use RTK Query to fetch course data
  const {
    data: courseData,
    isLoading,
    error: queryError
  } = useGetCourseByIdQuery(courseId!, {
    skip: !courseId, // Skip query if courseId is null
  });

  const course = courseData?.data?.course?.[0] || {};
  const error = propError || (queryError ? 'Failed to fetch course data' : null);
  const [chapters, setChapters] = useState(initialChapters);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const router = useRouter();

  const handleAddChapter = (chapter: { name: string }) => {
    setChapters((prev) => [...prev, { ...chapter, id: Date.now().toString() }]);
    setShowAdd(false);
  };

  const handleContinueCourse = () => {
    if (course?._id) {
      router.push(`/courses/${course._id}/learn`);
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (course?._id) {
      router.push(`/courses/${course._id}/chapters/${chapterId}`);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate course stats
  const totalLessons = course.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0;
  const completedLessons = 0; // TODO: Calculate from enrollment data
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;


  console.log(course);

  return (
    // <div className="bg-white min-h-screen">
    <Container size="xl" padding="sm" className="bg-white">

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row bg-off-white-3 p-4 mx-4 rounded-lg">

        <div className="flex-1">
          {/* Back Button */}
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium"
            onClick={() => router.back()}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-8 justify-between">

          {/* Left - Details */}
          <div className="flex-3">
            {/* Rating and Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-3xl text-sm font-medium">
                <span className="text-orange-600">★</span>
                <span className="text-white">{course.rating?.average?.toFixed(1) || "4.5"}</span>
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
                <span>{course.chapters?.length || 0} Chapter</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <span>{totalLessons || 0} Lesson</span>
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

            {/* Enroll Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium"
              onClick={handleContinueCourse}
            >
              Enroll Now
            </Button>
          </div>

          {/* Right Stats Card */}
          <div className="lg:w-96 flex flex-2 items-center mt-4 md:mt-0">
            <div className="text-white rounded-2xl p-4 relative overflow-hidden bg-cover bg-center min-h-[300px] w-full flex flex-col justify-between"
              style={{ backgroundImage: `url(${course?.thumbnail})` }}
            >
              {/* Category Badge */}
              <div className="flex justify-end items-start mb-4">
                <Badge className="bg-white text-black border-white/30">
                  {course.category || "Design & Development"}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">32%</div>
                  <div className="text-base text-gray-300">Completed</div>
                </div>
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">20 Days</div>
                  <div className="text-base text-gray-300">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="text-md font-bold mb-1">13 Lesson</div>
                  <div className="text-base text-gray-300">Incomplete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>

      {/* Course Outline Section */}
      <div className="flex mt-6">

        <div className="flex-1 hidden md:flex"></div>

        <div className="flex-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Outline</h2>

          {/* Understanding DevOps & SDLC */}
          {/* <div className="border-b border-gray-100">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChapter('c1')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">Aa</span>
                  </div>
                  <span className="text-gray-900 font-medium text-lg">Understanding DevOps & SDLC</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div> */}

          {course?.chapters?.map((chapter) => {
            return (
              <div
                className="bg-off-white-1 flex items-center justify-between p-3 my-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"

                key={chapter?._id}
                onClick={() => toggleChapter(chapter?._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">Aa</span>
                  </div>
                  <span className="text-gray-900 font-medium text-lg">{chapter?.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            )
          })}

        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>

      <AddChapterModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={handleAddChapter}
      />
    </Container>
    // </div>
  );
}