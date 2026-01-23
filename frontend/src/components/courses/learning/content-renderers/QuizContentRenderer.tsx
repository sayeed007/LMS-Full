import { LessonContent } from "@/types/backend-models";
import { EmbeddedQuizRenderer } from "../EmbeddedQuizRenderer";
import { FileText } from "lucide-react";

interface QuizContentRendererProps {
  content: LessonContent;
  onComplete: (contentId: string) => void;
}

export function QuizContentRenderer({
  content,
  onComplete,
}: QuizContentRendererProps) {
  return (
    <EmbeddedQuizRenderer
      quizData={
        content.data.quiz || {
          attempts: 0,
          passingScore: 0,
          questions: [],
          shuffleQuestions: false,
          showFeedback: false,
          timeLimit: 0,
        }
      }
      onComplete={() => onComplete(content._id)}
    />
  );
}

// Fallback renderer for unsupported content types
interface UnsupportedContentRendererProps {
  content: LessonContent;
}

export function UnsupportedContentRenderer({
  content,
}: UnsupportedContentRendererProps) {
  return (
    <div className="text-center py-8 text-gray-500">
      <FileText className="w-8 h-8 mx-auto mb-2" />
      <p>Content type &quot;{content.type}&quot; is not supported</p>
    </div>
  );
}
