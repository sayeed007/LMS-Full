import { ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LessonPlayerHeaderProps {
  lessonTitle: string;
  currentLessonIndex: number;
  totalLessons: number;
  isCompleted: boolean;
  isCompletingLesson: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export function LessonPlayerHeader({
  lessonTitle,
  currentLessonIndex,
  totalLessons,
  isCompleted,
  isCompletingLesson,
  onBack,
  onComplete
}: LessonPlayerHeaderProps) {
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div className="h-6 border-l border-gray-300"></div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {lessonTitle}
              </h1>
              <p className="text-sm text-gray-500">
                Lesson {currentLessonIndex + 1} of {totalLessons}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Progress
              value={((currentLessonIndex + 1) / totalLessons) * 100}
              className="w-32"
            />
            {!isCompleted && (
              <Button
                onClick={onComplete}
                disabled={isCompletingLesson}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompletingLesson ? (
                  'Completing...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            )}
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
