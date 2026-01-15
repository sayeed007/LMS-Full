import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddSectionMutation } from "@/store/api/questionBankApi";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";

interface CreateSectionModalProps {
  questionBankId: string;
  onSuccess: (sectionId: string, sectionName: string) => void;
}

export default function CreateSectionModal({
  questionBankId,
  onSuccess,
}: CreateSectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addSection, { isLoading }] = useAddSectionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showErrorToast("Please enter a section name");
      return;
    }

    try {
      const result = await addSection({
        id: questionBankId,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      }).unwrap();

      // Find the newly created section
      const newSection = result.data.questionBank.sections.find(
        (s) => s.name === name.trim()
      );

      if (newSection) {
        showSuccessToast("Section created successfully");
        onSuccess(newSection._id, newSection.name);
      }
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to create section");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create Section</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create a new section to organize questions within this bank
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="sectionName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Section Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="sectionName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Variables and Data Types"
            className="w-full"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="sectionDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="sectionDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this section..."
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
