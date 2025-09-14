"use client";

import { CourseCard } from "@/components/CourseCard";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, TabNav } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CourseDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

// Example course data
const allCourses = [
  {
    id: "1",
    name: "UI/UX Roadmap",
    category: "Design & Development",
    description:
      "Equip learners with foundational to intermediate knowledge of UI/UX principles, visual design standards, usability heuristics...",
    difficulty: "Beginner",
    chapters: 4,
    lessons: 15,
    quizzes: 2,
    image: "https://picsum.photos/400/400?random=1",
    owner: "me",
  },
  {
    id: "2",
    name: "SQL & Testing",
    category: "Database",
    description:
      "Learn SQL for manual & automated testing with best practices to ensure software quality...",
    difficulty: "Intermediate",
    chapters: 4,
    lessons: 15,
    quizzes: 3,
    image: "https://picsum.photos/400/400?random=2",
    owner: "assigned",
  },
  {
    id: "3",
    name: "System Design",
    category: "Backend",
    description: "Understand the core principles of scalable system design...",
    difficulty: "Advanced",
    chapters: 5,
    lessons: 20,
    quizzes: 2,
    image: "https://picsum.photos/400/400?random=3",
    owner: "all",
  },
  {
    id: "4",
    name: "System Design",
    category: "Backend",
    description: "Understand the core principles of scalable system design...",
    difficulty: "Advanced",
    chapters: 5,
    lessons: 20,
    quizzes: 2,
    image: "https://picsum.photos/400/400?random=4",
    owner: "all",
  },
  {
    id: "5",
    name: "System Design",
    category: "Backend",
    description: "Understand the core principles of scalable system design...",
    difficulty: "Advanced",
    chapters: 5,
    lessons: 20,
    quizzes: 2,
    image: "https://picsum.photos/400/400?random=5",
    owner: "all",
  },
];

const tabs = [
  { key: "my", label: "My Authoring" },
  { key: "assigned", label: "Assigned Courses" },
  { key: "all", label: "All Course" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState(allCourses);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const router = useRouter();

  const handleCreateCourse = (course: CourseDetails) => {
    const newCourse = { ...course, id: Date.now().toString(), owner: "me" };
    setCourses((prev) => [...prev, newCourse]);
    setShowCreate(false);
    router.push(`/courses/create`);
  };

  const filteredCourses = useMemo(() => {
    if (activeTab === "all") return courses;
    return courses.filter(course => course.owner === activeTab);
  }, [courses, activeTab]);

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

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {filteredCourses.map((course, index) => (
                <CourseCard key={`${course.id}-${index}`} course={course} />
              ))}
            </div>
          ) : (
            <EmptyStateWithCreate
              message="No course to show"
              description="Courses you've created will show up here."
              buttonText="Create Now"
              onClick={() => setShowCreate(true)}
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
