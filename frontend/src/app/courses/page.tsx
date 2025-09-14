"use client";

import { CourseCard } from "@/components/CourseCard";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { Button } from "@/components/ui/button";
import { CourseDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    router.push(`/courses/create`); // redirect to builder view
  };

  // Filter courses based on tab

  return (
    <div className="px-4 min-h-screen pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b-2 border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm ${activeTab === tab.key
              ? "font-bold"
              : "text-grey-2 hover:text-dark"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowCreate(true)}
        className="bg-info text-white px-6 py-2font-medium hover:bg-info/90 transition"
      >
        Create Now
      </Button>

      {/* Grid of Course Cards */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mt-4">
          {courses.map((course, index) => (
            <CourseCard key={`${course.id}-${index}`} course={course} />
          ))}
        </div>
      ) : (
        <EmptyStateWithCreate
          message="No course to show"
          description="Courses you’ve created will show up here."
          buttonText="Create Now"
          onClick={() => setShowCreate(true)}
        />
      )}

      {/* Create Course Modal */}
      <CreateCourseModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreate={handleCreateCourse}
      />
    </div>
  );
}
