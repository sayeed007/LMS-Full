// QuestionsPageClient.tsx - Client Component
"use client";

import { PickQuestionDialog } from "@/components/question-bank/PickQuestionDialog";
import QuestionBankEditor from "@/components/question-bank/QuestionBankEditor";
import {
  SettingsPopup,
  type SettingsData,
} from "@/components/question-bank/QuestionBankSettingsPopup";
import { GoBackRoute } from "@/components/reports/GoBackRoute";
import { Input } from "@/components/ui/input";
import PrimaryActionButton from "@/components/ui/PrimaryButton";
import PrimaryOutlineButton from "@/components/ui/PrimaryOutlineButton";
import { useConfirm } from "@/hooks/useConfirm";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  QuestionPopulated,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useDuplicateQuestionMutation,
  useGetQuestionsByQuestionBankQuery,
  useUpdateQuestionMutation,
  type CreateQuestionRequest,
} from "@/store/api/questionApi";
import {
  useGetQuestionBankQuery,
  useUpdateQuestionBankMutation,
  useUpdateSectionMutation,
} from "@/store/api/questionBankApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "../ui";

interface QuestionsPageClientProps {
  questionBankId: string;
  sectionId?: string;
}

export function QuestionsPageClient({
  questionBankId,
  sectionId,
}: QuestionsPageClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [sectionName, setSectionName] = useState("");
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  // showAddQuestionPopup removed as it is now handled in QuestionBankEditor
  const [showPickQuestionPopup, setShowPickQuestionPopup] = useState(false);

  // Track modified questions for batch save
  const [modifiedQuestions, setModifiedQuestions] = useState<
    Map<string, QuestionPopulated>
  >(new Map());

  // Fetch question bank data
  const { data: questionBankData, isLoading: isLoadingBank } =
    useGetQuestionBankQuery(questionBankId);

  // Fetch questions for this question bank
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useGetQuestionsByQuestionBankQuery({ questionBankId, sectionId });

  // Mutations
  const [updateQuestionBank] = useUpdateQuestionBankMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [duplicateQuestion] = useDuplicateQuestionMutation();
  const [updateSection] = useUpdateSectionMutation();

  const questionBank = questionBankData?.data?.questionBank;
  const questions = questionsData?.data?.questions || [];

  useEffect(() => {
    if (questionBank && sectionId) {
      // Find the section name from the question bank's sections
      const section = questionBank.sections?.find(
        (s: { _id: string; name: string }) => s._id === sectionId
      );
      if (section) {
        setSectionName(section.name);
      }
    }
  }, [questionBank, sectionId]);

  const createQuestionTemplate = (type: string): Partial<QuestionPopulated> => {
    const baseQuestion: Partial<QuestionPopulated> = {
      type: type as
        | "single-choice"
        | "multiple-choice"
        | "descriptive"
        | "true-false"
        | "fill-blank",
      text: "New Question",
      questionBank: questionBankId as unknown as { _id: string; name: string },
      bankSection: sectionId, // Optional internal section within the question bank
      difficulty: "medium",
      points: 1,
      timeLimit: 0,
      tags: [],
      isPublic: false,
    };

    // Add default choices for choice-based questions
    if (
      type === "single-choice" ||
      type === "multiple-choice" ||
      type === "true-false"
    ) {
      baseQuestion.choices = [
        { text: "Option 1", isCorrect: true },
        { text: "Option 2", isCorrect: false },
      ];
    }

    return baseQuestion;
  };

  const handleAddQuestion = async (type?: string) => {
    if (!type) return;

    if (type === "question-bank") {
      setShowPickQuestionPopup(true);
      return;
    }

    try {
      const newQuestionData = createQuestionTemplate(type);
      await createQuestion(
        newQuestionData as unknown as CreateQuestionRequest
      ).unwrap();
      showSuccessToast("Question added successfully");
      refetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      showErrorToast("Failed to add question", "Please try again");
    }
  };

  const handleImportQuestions = async (questionIds: string[]) => {
    try {
      // Execute duplications in parallel
      const promises = questionIds.map((id) =>
        duplicateQuestion({
          id,
          questionBankId, // Target is current bank
          sectionId, // Target is current section (if any)
        }).unwrap()
      );

      await Promise.all(promises);
      showSuccessToast(`Successfully imported ${questionIds.length} questions`);
      refetchQuestions();
    } catch (error) {
      console.error("Error importing questions:", error);
      showErrorToast("Failed to import some questions", "Please try again");
    }
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionPopulated) => {
    // Store in modified questions map (no API call yet)
    setModifiedQuestions((prev) => {
      const newMap = new Map(prev);
      newMap.set(updatedQuestion._id, updatedQuestion);
      return newMap;
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = await confirm({
      title: "Delete Question",
      message: "Are you sure you want to delete this question?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteQuestion(questionId).unwrap();
      showSuccessToast("Question deleted successfully");
      refetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      showErrorToast("Failed to delete question", "Please try again");
    }
  };

  const handlePreview = () => {
    router.push(`/question-bank/${questionBankId}/preview`);
  };

  const handleSave = async () => {
    try {
      // Update section name in the question bank
      if (questionBank && sectionId && sectionName) {
        await updateSection({
          id: questionBankId,
          sectionId,
          data: { name: sectionName },
        }).unwrap();
      }

      // Save all modified questions AND update order for all questions
      // We need to save all questions to update their order field
      const questionsToSave = questionsData?.data?.questions || [];

      if (questionsToSave.length > 0) {
        const updatePromises = questionsToSave.map((question, index) => {
          // Check if this question was modified
          const modifiedQuestion = modifiedQuestions.get(question._id);

          // Use modified data if available, otherwise use existing data
          const questionData = modifiedQuestion || question;

          // Filter out empty choices before saving
          const validChoices =
            questionData.choices?.filter(
              (c) => c.text && c.text.trim() !== ""
            ) || [];

          return updateQuestion({
            id: questionData._id,
            data: {
              text: questionData.text,
              choices: validChoices,
              explanation: questionData.explanation,
              difficulty: questionData.difficulty,
              points: questionData.points,
              timeLimit: questionData.timeLimit,
              tags: questionData.tags,
              order: index, // Set order based on current position in the list
            },
          }).unwrap();
        });

        await Promise.all(updatePromises);
        setModifiedQuestions(new Map()); // Clear modified questions
      }

      showSuccessToast("Question bank saved successfully");
      refetchQuestions(); // Refresh to get latest data
    } catch (error) {
      console.error("Error saving question bank:", error);
      showErrorToast("Failed to save", "Please try again");
    }
  };

  const handleSaveSettings = async (settings: SettingsData) => {
    try {
      await updateQuestionBank({
        id: questionBankId,
        data: {
          settings: settings as unknown as Record<string, unknown>,
        } as unknown as Record<string, unknown>,
      }).unwrap();
      showSuccessToast("Settings saved successfully");
      setShowSettingsPopup(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      showErrorToast("Failed to save settings", "Please try again");
    }
  };

  const handleSettingsClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowSettingsPopup((prev) => !prev);
  };

  const handleCloseSettings = () => {
    setShowSettingsPopup(false);
  };

  if (isLoadingBank || isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question bank...</p>
        </div>
      </div>
    );
  }

  return (
    <Container size="xl" padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-12">
        {/* LEFT - NAME */}
        <div className="flex items-center gap-4 flex-2">
          <GoBackRoute />
          <div className="relative flex items-center gap-2 flex-2">
            <Input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="flex-1 text-lg pr-10 font-medium bg-transparent outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:border focus:border-gray-300"
              placeholder="Enter section name..."
            />
            <Image
              src="/icons/Cross.png"
              alt="Cross"
              width={16}
              height={16}
              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              onClick={() => setSectionName("")}
            />
          </div>
        </div>

        {/* RIGHT - Buttons */}
        <div className="flex items-center justify-end gap-2 flex-1">
          <div className="relative">
            <div
              onClick={(e) => handleSettingsClick(e)}
              className="cursor-pointer bg-transparent border-2 border-[#0ea5e9] text-[#0ea5e9] rounded-lg p-2 hover:bg-[#0ea5e9] hover:text-white transition-all duration-200 flex items-center justify-center w-10 h-10"
            >
              <Image
                src={"/icons/Settings.png"}
                alt={"Settings"}
                width={20}
                height={20}
              />
            </div>

            {/* Settings popup */}
            <SettingsPopup
              isOpen={showSettingsPopup}
              onClose={handleCloseSettings}
              onSave={handleSaveSettings}
            />
          </div>

          <PrimaryOutlineButton onClick={handlePreview}>
            Preview
          </PrimaryOutlineButton>

          <PrimaryActionButton onClick={handleSave}>Save</PrimaryActionButton>
        </div>
      </div>

      {/* Section Content */}
      <div>
        {/* Questions List */}
        <div className="space-y-6 mb-6">
          <QuestionBankEditor
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>

        {/* Pick Question Dialog */}
        <PickQuestionDialog
          isOpen={showPickQuestionPopup}
          onClose={() => setShowPickQuestionPopup(false)}
          onImport={handleImportQuestions}
          currentQuestionBankId={questionBankId}
        />
      </div>
    </Container>
  );
}
