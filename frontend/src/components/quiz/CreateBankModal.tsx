import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuestionBankMutation } from "@/store/api/questionBankApi";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";

interface CreateBankModalProps {
  courseId: string;
  onSuccess: (bankId: string, bankName: string) => void;
}

export default function CreateBankModal({
  courseId,
  onSuccess,
}: CreateBankModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createBank, { isLoading }] = useCreateQuestionBankMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showErrorToast("Please enter a bank name");
      return;
    }

    try {
      const result = await createBank({
        name: name.trim(),
        description: description.trim() || undefined,
        course: courseId,
      }).unwrap();

      showSuccessToast("Question bank created successfully");
      onSuccess(result.data.questionBank._id, result.data.questionBank.name);
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to create question bank");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Create Question Bank
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Create a new question bank to organize your quiz questions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="bankName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bank Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="bankName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., JavaScript Fundamentals"
            className="w-full"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="bankDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="bankDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this question bank..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
