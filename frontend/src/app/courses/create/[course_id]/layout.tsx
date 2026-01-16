"use client";

import { Button } from "@/components/ui/button";
import { useGetCourseByIdQuery } from "@/store/api/courseApi";
import { useAppSelector } from "@/store/hooks";
import { useState, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import SimplePageContainer from "@/components/layout/SimplePageContainer";
import TabNav from "@/components/ui/TabNav";
import { CourseHeaderContext } from "./CourseHeaderContext";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showHeaderActions, setShowHeaderActions] = useState(false);

  // Get course ID from URL params and current pathname
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const courseId = (params?.course_id as string) || "";

  // Get current user from auth state
  const user = useAppSelector((state) => state.auth.user);

  // Fetch course data
  const {
    data: courseData,
    isLoading,
    error,
  } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const course = courseData?.data?.course;

  // Check if current user is the owner/instructor of this course
  const isOwner = useMemo(() => {
    if (!user || !course) return false;

    // Check if user is the instructor
    if (typeof course?.instructor === "string") {
      return course.instructor === user._id;
    } else if (course.instructor && typeof course.instructor === "object") {
      return course.instructor._id === user._id;
    }

    // Check if user is the creator (createdBy)
    if (typeof course.createdBy === "string") {
      return course.createdBy === user._id;
    } else if (course.createdBy && typeof course.createdBy === "object") {
      return course.createdBy._id === user._id;
    }

    return false;
  }, [user, course]);

  // Check if we're on a nested route (like content editor or preview)
  const isOnNestedRoute = useMemo(() => {
    return (
      (pathname.includes("/courseOutline/") && pathname.includes("/content")) ||
      pathname.includes("/preview")
    );
  }, [pathname]);

  // Define tabs with their target paths
  // The 'key' is used for the TabNav to know which one is active
  // We'll determine the active key based on the current pathname
  const tabs = [
    {
      key: "outline",
      label: "Course Outline",
      path: `/courses/create/${courseId}/courseOutline`,
    },
    {
      key: "learners",
      label: "Learners",
      path: `/courses/create/${courseId}/learner`,
    },
    {
      key: "evaluation",
      label: "Evaluation",
      path: `/courses/create/${courseId}/evaluation`,
    }, // Assuming this route exists or will be created
    {
      key: "leaderboard",
      label: "Leaderboard",
      path: `/courses/create/${courseId}/leaderboard`,
    },
    {
      key: "setting",
      label: "Setting",
      path: `/courses/create/${courseId}/setting`,
    },
  ];

  // Determine active tab based on pathname
  const activeTab = useMemo(() => {
    if (pathname.includes("/courseOutline")) return "outline";
    if (pathname.endsWith("/learner")) return "learners";
    if (pathname.endsWith("/evaluation")) return "evaluation";
    if (pathname.endsWith("/leaderboard")) return "leaderboard";
    if (pathname.endsWith("/setting")) return "setting";
    return ""; // No tab active if none match
  }, [pathname]);

  const handleTabChange = (key: string) => {
    const tab = tabs.find((t) => t.key === key);
    if (tab) {
      router.push(tab.path);
    }
  };

  // Show error state if course fetch failed
  if (error) {
    return (
      <div className="min-h-[60vh] px-6 pt-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600">
            {`The course you're looking for doesn't exist or you don't have access to it.`}
          </p>
        </div>
      </div>
    );
  }

  // If we're on a nested route, just render the children without the tab layout
  if (isOnNestedRoute) {
    return (
      <CourseHeaderContext.Provider
        value={{ showHeaderActions, setShowHeaderActions }}
      >
        <SimplePageContainer containerSize="xl" containerPadding="none">
          {children}
        </SimplePageContainer>
      </CourseHeaderContext.Provider>
    );
  }

  return (
    <CourseHeaderContext.Provider
      value={{ showHeaderActions, setShowHeaderActions }}
    >
      <SimplePageContainer
        containerSize="xl"
        containerPadding="none"
        className="my-4"
      >
        {/* Header */}
        <div className="relative flex items-center justify-center mb-4 h-10">
          <div className="absolute left-1/2 -translate-x-1/2 font-bold text-xl">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
            ) : (
              course?.title || "Course Title"
            )}
          </div>

          {(showHeaderActions || isOwner) && (
            <div className="absolute right-0 flex gap-2">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                Publish
              </Button>
              <Button
                variant="outline"
                className="border border-blue-600 text-blue-600"
                onClick={() =>
                  router.push(`/courses/create/${courseId}/preview`)
                }
              >
                Preview
              </Button>
              <Button
                variant="outline"
                className="border border-blue-600 text-blue-600"
              >
                More
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <TabNav
            tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="underline"
          />
        </div>

        {/* Render the children (the page content) */}
        {children}
      </SimplePageContainer>
    </CourseHeaderContext.Provider>
  );
}
