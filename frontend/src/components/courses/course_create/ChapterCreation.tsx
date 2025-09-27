"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface ChapterCreationProps {
  isCreatingChapter: boolean;
  setIsCreatingChapter: (value: boolean) => void;
  onCreateChapter: (chapterName: string) => void;
}

export default function ChapterCreation({
  isCreatingChapter,
  setIsCreatingChapter,
  onCreateChapter,
}: ChapterCreationProps) {
  const [chapterName, setChapterName] = useState("");

  const handleCreateChapter = () => {
    if (chapterName.trim()) {
      onCreateChapter(chapterName.trim());
      setChapterName("");
      setIsCreatingChapter(false);
    }
  };

  if (!isCreatingChapter) return null;

  return (
    <div className="bg-white shadow border border-gray-200 rounded-md p-4 flex items-center gap-4">
      <div className="relative w-full flex-1">
        <Input
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          placeholder="Enter Chapter Name"
          className="pr-10"
        />
        {chapterName && (
          <button
            type="button"
            onClick={() => setChapterName("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>

      <Button
        onClick={handleCreateChapter}
        className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
      >
        Create
      </Button>
      <Button
        onClick={() => setIsCreatingChapter(false)}
        variant="ghost"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
