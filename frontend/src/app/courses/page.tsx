"use client";

import { CourseCard } from "@/components/CourseCard";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, TabNav } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CourseDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useGetCoursesQuery, useGetMyCoursesQuery, useGetEnrolledCoursesQuery } from "@/store/api/courseApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component
const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-4 animate-pulse">
        <div className="h-40 w-full bg-gray-200 rounded-md"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-3 w-full bg-gray-200 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const tabs = [
  { key: "my", label: "My Courses" },
  { key: "enrolled", label: "Enrolled Courses" },
  { key: "all", label: "All Courses" },
];

export default function CoursesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const router = useRouter();

  // API queries based on active tab
  const {
    data: allCoursesData,
    isLoading: isLoadingAll,
    error: allCoursesError
  } = useGetCoursesQuery(
    { page: 1, limit: 50 },
    { skip: activeTab !== "all" }
  );

  const {
    data: myCoursesData,
    isLoading: isLoadingMy,
    error: myCoursesError
  } = useGetMyCoursesQuery(
    undefined,
    { skip: activeTab !== "my" }
  );

  const {
    data: enrolledCoursesData,
    isLoading: isLoadingEnrolled,
    error: enrolledCoursesError
  } = useGetEnrolledCoursesQuery(
    { page: 1, limit: 50 },
    { skip: activeTab !== "enrolled" }
  );

  const handleCreateCourse = (course: CourseDetails) => {
    setShowCreate(false);
    router.push(`/courses/create`);
  };

  // Get current data and loading state based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "all":
        return {
          courses: allCoursesData?.data?.courses || [],
          isLoading: isLoadingAll,
          error: allCoursesError
        };
      case "my":
        return {
          courses: myCoursesData?.data || [],
          isLoading: isLoadingMy,
          error: myCoursesError
        };
      case "enrolled":
        return {
          courses: enrolledCoursesData?.data?.courses || [],
          isLoading: isLoadingEnrolled,
          error: enrolledCoursesError
        };
      default:
        return { courses: [], isLoading: false, error: null };
    }
  };

  const { courses, isLoading, error } = getCurrentData();

  // Handle API errors
  if (error) {
    showErrorToast(
      `Failed to load ${activeTab === "my" ? "your" : activeTab} courses`
    );
  }

  return (
    <>
      <PageLayout
        title="Courses"
        actions={
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
          >
            Create Now
          </Button>
        }
      >
        <div className="space-y-6">
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {isLoading ? (
            <CoursesSkeleton />
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {courses.map((course, index) => (
                <CourseCard key={`${course._id}-${index}`} course={{
                  id: course._id,
                  name: course.title,
                  category: course.category,
                  description: course.description,
                  difficulty: course.difficulty,
                  chapters: course.chapters?.length || 0,
                  lessons: course.stats?.totalLessons || 0,
                  quizzes: course.stats?.totalQuizzes || 0,
                  image: course.thumbnail || `https://picsum.photos/400/400?random=${index + 1}`,
                  owner: activeTab === "my" ? "me" : activeTab === "enrolled" ? "enrolled" : "all"
                }} />
              ))}
            </div>
          ) : (
            <EmptyStateWithCreate
              message={`No ${activeTab === "my" ? "courses created" : activeTab === "enrolled" ? "enrolled courses" : "courses available"}`}
              description={getEmptyStateDescription(activeTab)}
              buttonText={activeTab === "my" ? "Create Now" : "Browse Courses"}
              onClick={() => {
                if (activeTab === "my") {
                  setShowCreate(true);
                } else {
                  setActiveTab("all");
                }
              }}
            />
          )}
        </div>
      </PageLayout>

      <CreateCourseModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreate={handleCreateCourse}
      />
    </>
  );
}

// Helper function for empty state descriptions
function getEmptyStateDescription(activeTab: string): string {
  switch (activeTab) {
    case "my":
      return "Courses you've created will show up here.";
    case "enrolled":
      return "Courses you've enrolled in will show up here.";
    case "all":
      return "No courses are available at the moment.";
    default:
      return "";
  }
}
