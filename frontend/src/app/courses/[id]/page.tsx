"use client";
import { AddChapterModal } from "@/components/AddChapterModal";
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
    <div className="max-w-6xl mx-auto py-10 px-6">
      <button
        className="mb-4 text-sm text-info hover:underline font-semibold"
        onClick={() => router.back()}
      >
        &larr; Back
      </button>

      <div className="bg-white shadow rounded-2xl flex flex-col md:flex-row gap-6 p-6 mb-8">
        {/* Left Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">
              ★ {course.rating}
            </span>
            <span className="text-xs text-gray-500">Design & Development</span>
          </div>
          <h2 className="text-2xl font-bold text-dark">{course.name}</h2>
          <p className="text-sm text-gray-700 mb-1">
            by <span className="font-medium">{course.author}</span>
          </p>
          <p className="text-xs text-gray-500 mb-3">{course.publishDate}</p>

          <p className="text-gray-800 mb-2">{course.description}</p>
          <p className="text-sm text-gray-700 mb-2">{course.descriptionBn}</p>
          <p className="text-sm text-blue-600 font-semibold cursor-pointer">
            Read More
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-4">
            <span>{course.chapters} Chapter</span>
            <span>{course.lessons} Lesson</span>
            <span>{course.quizzes}{" Quiz's"}</span>
            <span>{course.hours} Hours</span>
            <span className="text-white bg-gray-800 px-2 py-1 rounded">
              {course.difficulty}
            </span>
          </div>

          <button className="mt-5 bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow hover:bg-blue-700">
            Continue Course
          </button>
        </div>

        {/* Right Stats Card */}
        <div className="bg-gray-900 text-white rounded-xl p-6 flex flex-col justify-between w-full md:w-80">
          <div className="mb-4 text-sm font-medium text-gray-300">
            <div className="bg-blue-600 px-3 py-1 inline-block rounded mb-2">
              Design & Development
            </div>
            <h3 className="text-lg font-bold leading-tight text-white">
              DATABASE for Software Developers
            </h3>
          </div>
          <div className="flex justify-between text-center mt-auto pt-4 border-t border-gray-700">
            <div>
              <div className="text-xl font-bold">{course.progress}%</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-xl font-bold">{course.timeLeft}</div>
              <div className="text-xs text-gray-400">Time Left</div>
            </div>
            <div>
              <div className="text-xl font-bold">{course.remainingLessons}</div>
              <div className="text-xs text-gray-400">Lesson</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Outline Section */}
      <div>
        <div className="text-xl font-bold text-dark mb-4">Course Outline</div>
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-gray-100 px-5 py-3 rounded-lg flex justify-between items-center"
            >
              <span className="text-dark font-medium">{chapter.name}</span>
              <span className="text-xl text-gray-500">&gt;</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="mt-4 bg-info text-white px-5 py-2 rounded font-semibold shadow hover:bg-info/90"
        >
          Add Chapter
        </button>
      </div>

      <AddChapterModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={handleAddChapter}
      />
    </div>
  );
}
