"use client";
import { AddChapterModal } from "@/components/AddChapterModal";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Dummy course data for now
const course = {
  id: "1",
  name: "Database for Software Developers",
  category: "Design & Development",
  description:
    "Database for Software Developers focuses on the core concepts of database design, management, and optimization. Learn how to work with relational and non-relational databases, perform queries, and understand data modeling and normalization techniques.",
  descriptionBn:
    "এই কোর্সটি ডেভেলপারদের জন্য যারা তাদের অ্যাপ্লিকেশনগুলোতে ডাটাবেস অন্তর্ভুক্ত করতে চান এবং ডেটা পরিচালনা অপ্টিমাইজ করতে চান।",
  author: "Sufian Huzaif",
  publishDate: "11 Apr 2025 | 10:49 AM",
  difficulty: "Advanced",
  chapters: 4,
  lessons: 15,
  quizzes: 3,
  hours: 24,
  rating: 4.5,
  progress: 32,
  timeLeft: "20 Days",
  remainingLessons: 13,
};

const initialChapters = [
  { id: "c1", name: "Understanding DevOps & SDLC" },
  { id: "c2", name: "Version Control and CI/CD Basics" },
  { id: "c3", name: "Building CI/CD Pipelines (Module 3-4)" },
  { id: "c4", name: "CI/CD Pipeline Fundamentals" },
];

export default function CourseDetailPage() {
  const [chapters, setChapters] = useState(initialChapters);
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const handleAddChapter = (chapter: { name: string }) => {
    setChapters((prev) => [...prev, { ...chapter, id: Date.now().toString() }]);
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-off-white-1">
      <Container size="lg" padding="lg">
        <button
          className="mb-6 text-sm text-info hover:underline font-semibold"
          onClick={() => router.back()}
        >
          &larr; Back
        </button>

        <div className="bg-white shadow-sm rounded-2xl flex flex-col lg:flex-row gap-8 p-8 mb-8">
          {/* Left Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-orange-500 bg-orange-100">
                ★ {course.rating}
              </Badge>
              <span className="text-sm text-gray-500">{course.category}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
            <p className="text-gray-600 mb-1">
              by <span className="font-medium">{course.author}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">{course.publishDate}</p>

            <div className="space-y-3 mb-6">
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{course.descriptionBn}</p>
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Read More
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-6">
              <span>{course.chapters} Chapter</span>
              <span>{course.lessons} Lesson</span>
              <span>{course.quizzes} Quizzes</span>
              <span>{course.hours} Hours</span>
              <Badge variant="secondary" className="bg-gray-800 text-white">
                {course.difficulty}
              </Badge>
            </div>

            <Button className="bg-blue-600 text-white font-semibold px-8 py-3 hover:bg-blue-700">
              Continue Course
            </Button>
          </div>

          {/* Right Stats Card */}
          <div className="bg-gray-900 text-white rounded-xl p-6 flex flex-col justify-between w-full lg:w-80">
            <div className="mb-6">
              <Badge className="bg-blue-600 text-white mb-3">
                {course.category}
              </Badge>
              <h3 className="text-lg font-bold leading-tight text-white">
                {course.name.toUpperCase()}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-xl font-bold">{course.progress}%</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{course.timeLeft}</div>
                <div className="text-xs text-gray-400">Time Left</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{course.remainingLessons}</div>
                <div className="text-xs text-gray-400">Lesson</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Outline Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Outline</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-gray-50 px-6 py-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="text-gray-900 font-medium">{chapter.name}</span>
                <span className="text-xl text-gray-500">&gt;</span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition-colors"
          >
            Add Chapter
          </Button>
        </div>

        <AddChapterModal
          open={showAdd}
          onOpenChange={setShowAdd}
          onAdd={handleAddChapter}
        />
      </Container>
    </div>
  );
}
