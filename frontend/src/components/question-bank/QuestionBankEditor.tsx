"use client";

import { Button } from "@/components/ui/button";
import { QuestionPopulated } from "@/store/api/questionApi";
import { Question } from "@/types/backend-models";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { SortableQuestionItem } from "./SortableQuestionItem";
import { QuestionTypesDialog } from "./QuestionTypePopUp";

interface QuestionBankEditorProps {
  questions: QuestionPopulated[];
  onAddQuestion: (type?: string) => void;
  onUpdateQuestion: (question: QuestionPopulated) => void;
  onDeleteQuestion: (id: string) => void;
  isLoading?: boolean;
  modifiedQuestionsMap?: Map<string, QuestionPopulated>;
}

export default function QuestionBankEditor({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  modifiedQuestionsMap = new Map(),
}: QuestionBankEditorProps) {
  // Track which questions are expanded (default: all collapsed)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  // State for QuestionTypesDialog
  const [showTypeDialog, setShowTypeDialog] = useState(false);

  // Track which questions have unsaved local modifications
  const [modifiedQuestions, setModifiedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Local state for editing questions (to avoid auto-save)
  const [localQuestions, setLocalQuestions] =
    useState<QuestionPopulated[]>(questions);

  // Sync with parent when questions prop changes (e.g., after save or refetch)
  // Smart merge: preserve local edits while adding new questions from backend
  useEffect(() => {
    const questionIds = questions.map((q) => q._id).join(",");
    const localIds = localQuestions.map((q) => q._id).join(",");

    // Only sync if the questions list structure changed (add/delete/reorder from backend)
    if (questionIds !== localIds) {
      // Smart merge: use modified versions from parent's Map, otherwise use backend data
      const merged = questions.map((backendQuestion) => {
        // Check if this question has unsaved modifications in the parent's Map
        const modifiedVersion = modifiedQuestionsMap.get(backendQuestion._id);
        if (modifiedVersion) {
          // Use the modified version from parent
          return modifiedVersion;
        }
        // Otherwise use the backend version
        return backendQuestion;
      });

      setLocalQuestions(merged);

      // Update our local tracking to match parent's modified questions
      const newModifiedSet = new Set<string>();
      modifiedQuestionsMap.forEach((_, questionId) => {
        newModifiedSet.add(questionId);
      });
      setModifiedQuestions(newModifiedSet);
    }
  }, [questions, localQuestions, modifiedQuestionsMap]);

  // Auto-expand newly added questions
  useEffect(() => {
    if (localQuestions.length > 0) {
      // Check the last question (newest)
      const latestQuestion = localQuestions[localQuestions.length - 1];
      if (latestQuestion.text === "New Question") {
        setExpandedQuestions((prev) => new Set(prev).add(latestQuestion._id));
      }

      // Also check the first question in case backend returns newest first
      const firstQuestion = localQuestions[0];
      if (
        firstQuestion.text === "New Question" &&
        firstQuestion._id !== latestQuestion._id
      ) {
        setExpandedQuestions((prev) => new Set(prev).add(firstQuestion._id));
      }
    }
  }, [localQuestions.length]);

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Update local state only (no API call)
  const handleLocalUpdate = (
    questionId: string,
    updates: Partial<Question>
  ) => {
    // Mark this question as modified
    setModifiedQuestions((prev) => new Set(prev).add(questionId));

    setLocalQuestions((prev) => {
      return prev.map((q) => {
        if (q._id === questionId) {
          const updatedQuestion = { ...q, ...updates } as QuestionPopulated;
          // Propagate to parent immediately with the updated question
          // Using setTimeout to ensure state update completes first
          setTimeout(() => {
            onUpdateQuestion(updatedQuestion);
            // Clear modified flag after successful save
            setModifiedQuestions((prevModified) => {
              const newSet = new Set(prevModified);
              newSet.delete(questionId);
              return newSet;
            });
          }, 0);
          return updatedQuestion;
        }
        return q;
      });
    });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for choice reordering
  const handleChoiceDragEnd = (event: DragEndEvent, questionId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const question = localQuestions.find((q) => q._id === questionId);
      if (!question || !question.choices) return;

      const oldIndex = question.choices.findIndex(
        (_, i) => `choice-${i}` === active.id
      );
      const newIndex = question.choices.findIndex(
        (_, i) => `choice-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newChoices = arrayMove(question.choices, oldIndex, newIndex);
        handleLocalUpdate(questionId, { choices: newChoices });
      }
    }
  };

  // Handle drag end for question reordering
  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localQuestions.findIndex((q) => q._id === active.id);
      const newIndex = localQuestions.findIndex((q) => q._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(localQuestions, oldIndex, newIndex);
        setLocalQuestions(newQuestions);
        // Propagate all reordered questions to parent
        newQuestions.forEach((q) => setTimeout(() => onUpdateQuestion(q), 0));
      }
    }
  };

  // Get summary text for collapsed view
  const getQuestionSummary = (question: QuestionPopulated) => {
    const text = question.text || "New Question";
    return text.length > 60 ? text.substring(0, 60) + "..." : text;
  };

  // Get correct answer count
  const getCorrectAnswerCount = (question: QuestionPopulated) => {
    if (!question.choices) return 0;
    return question.choices.filter((c) => c.isCorrect).length;
  };

  return (
    <div className="space-y-6">
      {localQuestions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-6">Add question to your quiz test</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleQuestionDragEnd}
        >
          <SortableContext
            items={localQuestions.map((q) => q._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {localQuestions.map((question, index) => (
                <SortableQuestionItem
                  key={question._id}
                  question={question}
                  index={index}
                  isExpanded={expandedQuestions.has(question._id)}
                  onToggleExpand={() => toggleExpand(question._id)}
                  onDelete={() => onDeleteQuestion(question._id)}
                  onUpdate={handleLocalUpdate}
                  sensors={sensors}
                  onChoiceDragEnd={handleChoiceDragEnd}
                  getQuestionSummary={getQuestionSummary}
                  getCorrectAnswerCount={getCorrectAnswerCount}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Question Button - Dashed line with centered button */}
      <div className="relative pt-8">
        <hr className="border-dashed border-gray-300" />
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2">
          <div className="relative">
            <Button
              onClick={() => setShowTypeDialog(true)}
              variant="outline"
              className="flex items-center gap-2 bg-white rounded-3xl border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>

            <QuestionTypesDialog
              isOpen={showTypeDialog}
              onClose={() => setShowTypeDialog(false)}
              onSelectType={(type) => {
                onAddQuestion(type);
                setShowTypeDialog(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
