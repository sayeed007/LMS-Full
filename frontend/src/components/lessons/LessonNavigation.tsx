import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LessonNavigationProps {
  previousLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
  onPrevious: () => void;
  onNext: () => void;
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  onPrevious,
  onNext
}: LessonNavigationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lesson Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onPrevious}
          disabled={!previousLesson}
          variant="outline"
          className="w-full justify-start"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {previousLesson ? `Previous: ${previousLesson.title}` : 'No Previous Lesson'}
        </Button>
        <Button onClick={onNext} disabled={!nextLesson} className="w-full justify-start">
          <ChevronRight className="h-4 w-4 mr-2" />
          {nextLesson ? `Next: ${nextLesson.title}` : 'Course Complete!'}
        </Button>
      </CardContent>
    </Card>
  );
}
