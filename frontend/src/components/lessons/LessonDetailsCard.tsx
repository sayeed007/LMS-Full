import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LessonResourcesList } from './LessonResourcesList';
import { type CourseLesson } from '@/types/backend-models';

interface LessonDetailsCardProps {
  lesson: CourseLesson;
}

export function LessonDetailsCard({ lesson }: LessonDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{lesson.title}</CardTitle>
          <Badge variant="secondary">Lesson</Badge>
        </div>
        {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <div className="prose max-w-none">
              {lesson.content && lesson.content.length > 0 ? (
                <div className="space-y-4">
                  {lesson.content.map((contentItem, index) => (
                    <div key={contentItem._id || index}>
                      {contentItem.type === 'text' && contentItem.data?.text && (
                        <div dangerouslySetInnerHTML={{ __html: contentItem.data.text }} />
                      )}
                      {/* Add more content type renderers as needed */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Content will be displayed here</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <LessonResourcesList resources={lesson.resources || []} />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Notes feature coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
