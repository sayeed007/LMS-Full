"use client";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash } from "lucide-react";

interface LessonListProps {
  lessons: string[];
  onDeleteLesson: (index: number) => void;
  onShowPopup: (event: React.MouseEvent, trigger: string) => void;
}

export default function LessonList({
  lessons,
  onDeleteLesson,
  onShowPopup,
}: LessonListProps) {
  return (
    <>
      {lessons.map((lesson, index) => (
        <div key={index}>
          <div className="bg-white border border-gray-200 shadow rounded-md p-4 flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <GripVertical className="text-gray-400" />
              <span className="text-base font-semibold flex items-center gap-2">
                📋 {lesson}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="border border-gray-200"
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="border border-gray-200"
                onClick={() => onDeleteLesson(index)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>

          {/* Add Content Button */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              className="rounded-full px-6 py-1 shadow-sm text-sm bg-white font-bold"
              onClick={(e) => onShowPopup(e, "content")}
            >
              + Add Content
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
