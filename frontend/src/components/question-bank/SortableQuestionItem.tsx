import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QuestionPopulated } from "@/store/api/questionApi";
import { Question } from "@/types/backend-models";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableChoiceItem } from "./SortableChoiceItem";

interface SortableQuestionItemProps {
  question: QuestionPopulated;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: any;
  onChoiceDragEnd: (event: DragEndEvent, questionId: string) => void;
  getQuestionSummary: (question: QuestionPopulated) => string;
  getCorrectAnswerCount: (question: QuestionPopulated) => number;
}

export function SortableQuestionItem({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onDelete,
  onUpdate,
  sensors,
  onChoiceDragEnd,
  getQuestionSummary,
  getCorrectAnswerCount,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const correctCount = getCorrectAnswerCount(question);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
    >
      {/* Question Header - Always Visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <span className="font-medium text-gray-900">
            Question {index + 1}
          </span>

          {!isExpanded && (
            <>
              <span className="text-gray-600 text-sm flex-1">
                {getQuestionSummary(question)}
              </span>
              {correctCount > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Correct Answer</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            {question.type.replace("-", " ")}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Question Details - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate(question._id, { text: e.target.value })}
              placeholder="Type your question here"
              rows={2}
              className="w-full"
            />
          </div>

          {/* Choices for single/multiple choice */}
          {(question.type === "single-choice" ||
            question.type === "multiple-choice") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choices
              </label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onChoiceDragEnd(event, question._id)}
              >
                <SortableContext
                  items={(question.choices || []).map((_, i) => `choice-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {question.choices?.map((choice, choiceIndex) => (
                      <SortableChoiceItem
                        key={`choice-${choiceIndex}`}
                        id={`choice-${choiceIndex}`}
                        choice={choice}
                        choiceIndex={choiceIndex}
                        questionType={question.type}
                        questionId={question._id}
                        onTextChange={(text) => {
                          const newChoices = (question.choices || []).map(
                            (c, i) =>
                              i === choiceIndex ? { ...c, text } : { ...c }
                          );
                          onUpdate(question._id, { choices: newChoices });
                        }}
                        onCorrectChange={(checked) => {
                          let newChoices;
                          if (question.type === "single-choice") {
                            newChoices = (question.choices || []).map(
                              (opt, i) => ({
                                ...opt,
                                isCorrect: i === choiceIndex,
                              })
                            );
                          } else {
                            newChoices = (question.choices || []).map(
                              (opt, i) =>
                                i === choiceIndex
                                  ? { ...opt, isCorrect: checked }
                                  : { ...opt }
                            );
                          }
                          onUpdate(question._id, { choices: newChoices });
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-blue-600"
                onClick={() => {
                  const newChoices = [
                    ...(question.choices || []).map((c) => ({ ...c })),
                    { text: "", isCorrect: false },
                  ];
                  onUpdate(question._id, { choices: newChoices });
                }}
              >
                + Add More Choice
              </Button>
            </div>
          )}

          {/* Score and Time Limit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">Required</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score
              </label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) =>
                  onUpdate(question._id, {
                    points: parseInt(e.target.value) || 1,
                  })
                }
                placeholder="Enter question score"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (min)
              </label>
              <Input
                type="number"
                value={
                  question.timeLimit ? Math.floor(question.timeLimit / 60) : 0
                }
                onChange={(e) =>
                  onUpdate(question._id, {
                    timeLimit: (parseInt(e.target.value) || 0) * 60,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
