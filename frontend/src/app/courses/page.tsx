"use client";

import { CourseCard } from "@/components/CourseCard";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, TabNav } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useModalActions } from "@/lib/modal-utils";
import { showErrorToast } from "@/lib/toast-utils";
import { useGetCoursesQuery, useGetEnrolledCoursesQuery, useGetMyCoursesQuery } from "@/store/api/courseApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CourseFilters from "@/components/courses/CourseFilters";

// Loading skeleton component
const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
  const [activeTab, setActiveTab] = useState("my");
  const { openModal, closeModal } = useModalActions();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state for "All Courses" tab
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Build query params for API
  const buildQueryParams = () => {
    const params: any = { page: 1, limit: 50 };

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.minRating) params.minRating = parseFloat(filters.minRating);
    if (filters.sort) params.sort = filters.sort;

    return params;
  };

  // API queries based on active tab
  const {
    data: allCoursesData,
    isLoading: isLoadingAll,
    error: allCoursesError
  } = useGetCoursesQuery(
    buildQueryParams(),
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

  const openCreateModal = () => {
    openModal(
      <CreateCourseModal
        onClose={() => closeModal()}
        onCreate={(courseId) => {
          // Redirect to course creation page with the new course ID
          router.push(`/courses/create/${courseId}`);
        }}
      />,
      { size: 'md', position: 'center' }
    );
  };

  // Get current data and loading state based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "all":
        return {
          courses: allCoursesData?.data || [],
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
          courses: enrolledCoursesData?.data || [],
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
        headerActions={
          <Button
            onClick={openCreateModal}
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

          {/* Show filters only for "All Courses" tab */}
          {activeTab === "all" && (
            <CourseFilters onFiltersChange={setFilters} />
          )}

          {isLoading ? (
            <CoursesSkeleton />
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course, index) => (
                <CourseCard
                  key={`${course._id}-${index}`}
                  course={{ ...course }}
                // course={{
                //   id: course._id,
                //   name: course.title,
                //   category: course.category,
                //   description: course.description,
                //   difficulty: course.difficulty,
                //   chapters: course.chapters?.length || 0,
                //   lessons: course.stats?.totalLessons || 0,
                //   quizzes: course.stats?.totalQuizzes || 0,
                //   image: course.thumbnail || `https://picsum.photos/400/400?random=${index + 1}`,
                //   owner: activeTab === "my" ? "me" : activeTab === "enrolled" ? "enrolled" : "all"
                // }}
                />
              ))}
            </div>
          ) : (
            <EmptyStateWithCreate
              message={`No ${activeTab === "my" ? "courses created" : activeTab === "enrolled" ? "enrolled courses" : "courses available"}`}
              description={getEmptyStateDescription(activeTab)}
              buttonText={activeTab === "my" ? "Create Now" : "Browse Courses"}
              onClick={() => {
                if (activeTab === "my") {
                  openCreateModal();
                } else {
                  setActiveTab("all");
                }
              }}
            />
          )}
        </div>
      </PageLayout>
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
