import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Lesson {
  _id: string;
  title: string;
  estimatedDuration?: number;
}

interface LessonListSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  onLessonClick: (lessonId: string) => void;
}

export function LessonListSidebar({
  lessons,
  currentLessonId,
  onLessonClick
}: LessonListSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {lessons.map((lesson, index) => (
            <button
              key={lesson._id}
              onClick={() => onLessonClick(lesson._id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                lesson._id === currentLessonId
                  ? 'bg-blue-100 border-blue-300 border'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      lesson._id === currentLessonId ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {index + 1}. {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {lesson.estimatedDuration || 0} min
                  </p>
                </div>
                {/* Show completion status */}
                <div className="ml-2">
                  {/* This would need to come from enrollment progress */}
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
