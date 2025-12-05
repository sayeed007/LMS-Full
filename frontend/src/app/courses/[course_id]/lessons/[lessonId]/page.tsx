'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useGetLessonByIdQuery, useGetLessonsQuery } from '@/store/api/courseApi';
import { useUpdateProgressMutation } from '@/store/api/enrollmentApi';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { LessonPlayerHeader } from '@/components/lessons/LessonPlayerHeader';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonDetailsCard } from '@/components/lessons/LessonDetailsCard';
import { LessonNavigation } from '@/components/lessons/LessonNavigation';
import { CourseProgressCard } from '@/components/lessons/CourseProgressCard';
import { LessonListSidebar } from '@/components/lessons/LessonListSidebar';
import { LessonPlayerSkeleton } from '@/components/lessons/LessonPlayerSkeleton';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;
  const lessonId = params.lessonId as string;

  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // API queries
  const {
    data: lessonData,
    isLoading: isLoadingLesson,
    error: lessonError
  } = useGetLessonByIdQuery({ courseId, lessonId });

  const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessonsQuery({
    courseId,
    params: { limit: 100 }
  });

  const [updateProgress, { isLoading: isCompletingLesson }] = useUpdateProgressMutation();

  const lesson = lessonData?.data?.lesson;
  const lessons = [...(lessonsData?.data?.lessons || [])].sort(
    (a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0)
  );

  // Find current lesson index and navigation
  const currentLessonIndex = lessons.findIndex((l: { _id: string }) => l._id === lessonId);
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  // Start timer when lesson begins
  useEffect(() => {
    if (lesson && !startTime) {
      setStartTime(new Date());
    }
  }, [lesson, startTime]);

  // Handle lesson completion
  const handleCompleteLesson = async () => {
    if (!startTime) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      await updateProgress({
        enrollmentId: 'temp', // This should come from enrollment context
        data: {
          lessonId,
          timeSpent
        }
      }).unwrap();

      setIsCompleted(true);
      showSuccessToast('Lesson completed successfully!');
    } catch (error) {
      console.error('Error completing lesson:', error);
      showErrorToast('Failed to mark lesson as complete');
    }
  };

  // Navigation handlers
  const handlePreviousLesson = () => {
    if (previousLesson) {
      router.push(`/courses/${courseId}/lessons/${previousLesson._id}`);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/courses/${courseId}/lessons/${nextLesson._id}`);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  // Loading state
  if (isLoadingLesson || isLoadingLessons) {
    return <LessonPlayerSkeleton />;
  }

  // Error state
  if (lessonError || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-4">
            The lesson you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonPlayerHeader
        lessonTitle={lesson.title}
        currentLessonIndex={currentLessonIndex}
        totalLessons={lessons.length}
        isCompleted={isCompleted}
        isCompletingLesson={isCompletingLesson}
        onBack={() => router.push(`/courses/${courseId}`)}
        onComplete={handleCompleteLesson}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <LessonContent lesson={lesson} />
            <LessonDetailsCard lesson={lesson} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LessonNavigation
              previousLesson={previousLesson}
              nextLesson={nextLesson}
              onPrevious={handlePreviousLesson}
              onNext={handleNextLesson}
            />

            <CourseProgressCard
              currentLessonIndex={currentLessonIndex}
              totalLessons={lessons.length}
              isCompleted={isCompleted}
            />

            <LessonListSidebar
              lessons={lessons}
              currentLessonId={lessonId}
              onLessonClick={handleLessonClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
