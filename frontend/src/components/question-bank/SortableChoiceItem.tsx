import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SortableChoiceItemProps {
  id: string;
  choice: { text: string; isCorrect: boolean; _id?: string };
  choiceIndex: number;
  questionType: string;
  questionId: string;
  onTextChange: (text: string) => void;
  onCorrectChange: (checked: boolean) => void;
}

export function SortableChoiceItem({
  id,
  choice,
  choiceIndex,
  questionType,
  questionId,
  onTextChange,
  onCorrectChange,
}: SortableChoiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type={questionType === "single-choice" ? "radio" : "checkbox"}
          name={`question_${questionId}`}
          checked={choice.isCorrect}
          onChange={(e) => onCorrectChange(e.target.checked)}
          className="w-4 h-4"
        />
      </div>
      <Input
        value={choice.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Enter choice ${choiceIndex + 1}`}
        className="flex-1"
      />
      {choice.isCorrect && (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>Correct Answer</span>
        </div>
      )}
    </div>
  );
}
