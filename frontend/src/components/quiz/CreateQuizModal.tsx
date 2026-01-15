import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateQuizModalProps {
  onConfirm: (title: string) => void;
}

export default function CreateQuizModal({ onConfirm }: CreateQuizModalProps) {
  const [title, setTitle] = useState("New Quiz");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title.trim() || "New Quiz");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create Quiz</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter a title for your quiz
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="quizTitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quiz Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="quizTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., JavaScript Fundamentals Quiz"
            className="w-full"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Quiz
          </Button>
        </div>
      </form>
    </div>
  );
}
