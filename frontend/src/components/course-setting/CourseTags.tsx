import React, { useState } from "react";

interface CourseTagsProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export function CourseTags({ tags, setTags }: CourseTagsProps) {
  const [tagInput, setTagInput] = useState("");

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim().replace(/,$/, "");
      if (!value) return;
      if (!tags.includes(value)) setTags((t) => [...t, value]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-sm font-medium mb-2">Add Tags</p>
      <div className="border rounded-md px-2 py-2 flex flex-wrap gap-2 min-h-[40px]">
        {tags.map((t) => (
          <span
            key={t}
            className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-200"
          >
            {t}
            <button className="ml-1" onClick={() => removeTag(t)}>
              ×
            </button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKeyDown}
          className="flex-1 min-w-[120px] outline-none"
          placeholder="Add tags"
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Type comma or press enter to add
      </div>
    </div>
  );
}
