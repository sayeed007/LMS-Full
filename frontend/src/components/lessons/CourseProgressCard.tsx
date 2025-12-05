import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CourseProgressCardProps {
  currentLessonIndex: number;
  totalLessons: number;
  isCompleted: boolean;
}

export function CourseProgressCard({
  currentLessonIndex,
  totalLessons,
  isCompleted
}: CourseProgressCardProps) {
  const completedLessons = currentLessonIndex + (isCompleted ? 1 : 0);
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Course Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Lessons Completed</span>
            <span>
              {completedLessons} / {totalLessons}
            </span>
          </div>
          <Progress value={progressPercentage} />
          <div className="text-xs text-gray-500 text-center">{progressPercentage}% Complete</div>
        </div>
      </CardContent>
    </Card>
  );
}
