import { Card, CardContent } from '@/components/ui/card';
import { type CourseLesson } from '@/types/backend-models';

interface LessonContentProps {
  lesson: CourseLesson;
}

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-8">
          <div className="prose max-w-none">
            {lesson.content && lesson.content.length > 0 ? (
              <div className="space-y-4">
                {lesson.content.map((contentItem, index) => (
                  <div key={contentItem._id || index}>
                    {contentItem.type === 'text' && contentItem.data?.text && (
                      <div dangerouslySetInnerHTML={{ __html: contentItem.data.text }} />
                    )}
                    {/* Additional content type renderers can be added here */}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h3>{lesson.title}</h3>
                {lesson.description && <p>{lesson.description}</p>}
                <p className="text-gray-600">Lesson content will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
