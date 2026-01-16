"use client";

import { CourseCard } from "@/components/CourseCard";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, TabNav } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useModalActions } from "@/lib/modal-utils";
import { showErrorToast, getErrorMessage } from "@/lib/toast-utils";
import {
  useGetCoursesQuery,
  useGetEnrolledCoursesQuery,
  useGetMyCoursesQuery,
} from "@/store/api/courseApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import CourseFiltersModal, {
  CourseFiltersType,
} from "@/components/courses/CourseFiltersModal";
import { useAppSelector } from "@/store/hooks";
import { SlidersHorizontal } from "lucide-react";

// Loading skeleton component
const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-lg shadow-sm border p-4 space-y-4 animate-pulse"
      >
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

const allTabs = [
  { key: "my", label: "My Courses", requiresAuth: true },
  { key: "enrolled", label: "Enrolled Courses", requiresAuth: true },
  { key: "all", label: "All Courses", requiresAuth: false },
];

export default function CoursesPage() {
  const { openModal, closeModal } = useModalActions();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get authentication state
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Smart default tab: "all" for guests, "my" for authenticated users
  const defaultTab = useMemo(() => {
    return isAuthenticated ? "my" : "all";
  }, [isAuthenticated]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when auth state changes
  useEffect(() => {
    // Only auto-switch if user is on a personal tab ("my" or "enrolled") and becomes unauthenticated
    if (!isAuthenticated && (activeTab === "my" || activeTab === "enrolled")) {
      setActiveTab("all");
    }
  }, [isAuthenticated, activeTab]);

  // Filter tabs based on authentication status
  const tabs = useMemo(() => {
    return isAuthenticated
      ? allTabs
      : allTabs.filter((tab) => !tab.requiresAuth);
  }, [isAuthenticated]);

  // Filter state for "All Courses" tab
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    sort: searchParams.get("sort") || "newest",
  });

  // Build query params for API
  const buildQueryParams = () => {
    const params: Record<string, string | number> = { page: 1, limit: 50 };

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
    error: allCoursesError,
  } = useGetCoursesQuery(buildQueryParams(), { skip: activeTab !== "all" });

  const {
    data: myCoursesData,
    isLoading: isLoadingMy,
    error: myCoursesError,
  } = useGetMyCoursesQuery(
    undefined,
    { skip: activeTab !== "my" || !isAuthenticated } // Skip if not authenticated
  );

  const {
    data: enrolledCoursesData,
    isLoading: isLoadingEnrolled,
    error: enrolledCoursesError,
  } = useGetEnrolledCoursesQuery(
    { page: 1, limit: 50 },
    { skip: activeTab !== "enrolled" || !isAuthenticated } // Skip if not authenticated
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
      { size: "md", position: "center" }
    );
  };

  const openFiltersModal = () => {
    openModal(
      <CourseFiltersModal
        initialFilters={filters}
        onApply={(newFilters: CourseFiltersType) => {
          setFilters(newFilters);
          // Update URL params
          const params = new URLSearchParams();
          Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
              params.set(key, value as string);
            }
          });
          router.push(`?${params.toString()}`, { scroll: false });
        }}
        onClose={() => closeModal()}
      />,
      {
        size: "md",
        position: "right",
        className: "max-w-md",
      }
    );
  };

  // Count active filters (excluding sort as it's always set)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.level) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minRating) count++;
    return count;
  }, [filters]);

  // Get current data and loading state based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "all":
        return {
          courses: allCoursesData?.data || [],
          isLoading: isLoadingAll,
          error: allCoursesError,
        };
      case "my":
        return {
          courses: myCoursesData?.data || [],
          isLoading: isLoadingMy,
          error: myCoursesError,
        };
      case "enrolled":
        return {
          courses: enrolledCoursesData?.data || [],
          isLoading: isLoadingEnrolled,
          error: enrolledCoursesError,
        };
      default:
        return { courses: [], isLoading: false, error: null };
    }
  };

  const { courses, isLoading, error } = getCurrentData();

  // Check if showing a personal tab without authentication
  const showAuthRequired =
    !isAuthenticated && (activeTab === "my" || activeTab === "enrolled");

  // Handle API errors with useEffect to prevent duplicate toasts
  useEffect(() => {
    if (error && !showAuthRequired) {
      const errorMessage = getErrorMessage(error, "Failed to load courses");
      showErrorToast(
        `Failed to load ${activeTab === "my" ? "your" : activeTab} courses`,
        errorMessage
      );
    }
  }, [error, activeTab, showAuthRequired]);

  return (
    <>
      <PageLayout
        title="Courses"
        headerActions={
          isAuthenticated ? (
            <Button
              onClick={openCreateModal}
              className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
            >
              Create Now
            </Button>
          ) : null
        }
      >
        <div className="space-y-6">
          {/* Tab Navigation with Filter Button */}
          <div className="flex items-center justify-between gap-4">
            <TabNav
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Filter Button - only show for "All Courses" tab */}
            {activeTab === "all" && (
              <Button
                onClick={openFiltersModal}
                variant="outline"
                className="relative flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-info hover:bg-info/5 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-info text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Show authentication required message for personal tabs when not logged in */}
          {showAuthRequired ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Authentication Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please log in to{" "}
                  {activeTab === "my"
                    ? "view and manage your courses"
                    : "view your enrolled courses"}
                  .
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => setActiveTab("all")}
                    variant="outline"
                    className="px-6 py-2 font-medium"
                  >
                    Browse All Courses
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <CoursesSkeleton />
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {courses.map((course, index) => (
                <CourseCard
                  key={`${course._id}-${index}`}
                  course={{ ...course }}
                  isOwner={activeTab === "my"}
                />
              ))}
            </div>
          ) : (
            <EmptyStateWithCreate
              message={`No ${
                activeTab === "my"
                  ? "courses created"
                  : activeTab === "enrolled"
                  ? "enrolled courses"
                  : "courses available"
              }`}
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
