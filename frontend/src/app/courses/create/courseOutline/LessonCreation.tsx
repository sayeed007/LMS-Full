"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface LessonCreationProps {
  isCreatingLesson: boolean;
  setIsCreatingLesson: (value: boolean) => void;
  onCreateLesson: (lessonName: string) => void;
}

export default function LessonCreation({
  isCreatingLesson,
  setIsCreatingLesson,
  onCreateLesson,
}: LessonCreationProps) {
  const [lessonName, setLessonName] = useState("");

  const handleCreateLesson = () => {
    if (lessonName.trim()) {
      onCreateLesson(lessonName.trim());
      setLessonName("");
      setIsCreatingLesson(false);
    }
  };

  if (!isCreatingLesson) return null;

  return (
    <div className="bg-white shadow border border-gray-200 rounded-md p-4 flex items-center gap-4">
      <div className="relative w-full flex-1">
        <Input
          value={lessonName}
          onChange={(e) => setLessonName(e.target.value)}
          placeholder="Enter Lesson Name"
          className="pr-10"
        />
        {lessonName && (
          <button
            type="button"
            onClick={() => setLessonName("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>

      <Button
        onClick={handleCreateLesson}
        className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
      >
        Create
      </Button>
      <Button
        onClick={() => setIsCreatingLesson(false)}
        variant="ghost"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
