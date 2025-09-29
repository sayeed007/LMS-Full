"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { X } from "lucide-react";
import { useState } from "react";

interface ChapterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapterData: ChapterData) => void;
  initialData?: ChapterData;
}

export interface ChapterData {
  title: string;
  description: string;
  order: number;
}

const initialChapterData: ChapterData = {
  title: "",
  description: "",
  order: 1,
};

export function ChapterCreationModal({ isOpen, onClose, onSave, initialData }: ChapterCreationModalProps) {
  const [chapterData, setChapterData] = useState<ChapterData>(initialData || initialChapterData);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!chapterData.title.trim()) {
      showErrorToast("Chapter title is required");
      return;
    }

    onSave(chapterData);
    showSuccessToast("Chapter saved successfully!");
    setChapterData(initialChapterData);
  };

  const handleClose = () => {
    setChapterData(initialChapterData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Chapter' : 'Create Chapter'}
          </h2>
          <Button variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chapter Title *</label>
            <Input
              value={chapterData.title}
              onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
              placeholder="Enter chapter title"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={chapterData.description}
              onChange={(e) => setChapterData({ ...chapterData, description: e.target.value })}
              placeholder="Enter chapter description"
              className="w-full border rounded-md px-3 py-2 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <Input
              type="number"
              value={chapterData.order}
              onChange={(e) => setChapterData({ ...chapterData, order: parseInt(e.target.value) || 1 })}
              placeholder="1"
              min="1"
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={!chapterData.title.trim()}
          >
            {initialData ? 'Update Chapter' : 'Create Chapter'}
          </Button>
        </div>
      </div>
    </div>
  );
}