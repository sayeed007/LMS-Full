"use client";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreVertical } from "lucide-react";

interface ChapterListProps {
  chapters: string[];
  onDeleteChapter: (index: number) => void;
  onShowPopup: (event: React.MouseEvent, trigger: string) => void;
}

export default function ChapterList({
  chapters,
  onDeleteChapter,
  onShowPopup,
}: ChapterListProps) {
  return (
    <>
      {chapters.map((chapter, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-md p-4 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { }}
              >
                <GripVertical className="h-[32px] w-[32px]" />
              </Button>
              <span className="text-base font-medium text-[18px]">
                {chapter}
              </span>
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center w-full my-4">
            <div className="flex-1 border-t border-dashed border-gray-300"></div>
            <div className="px-4">
              <Button
                variant="outline"
                className="border border-gray-300 text-gray-700 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={(e) => onShowPopup(e, "lesson")}
              >
                + Add Lesson
              </Button>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-300"></div>
          </div>
        </div>
      ))}
    </>
  );
}
