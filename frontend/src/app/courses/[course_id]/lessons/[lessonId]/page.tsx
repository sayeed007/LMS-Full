"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Download, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetLessonByIdQuery, useGetLessonsQuery } from "@/store/api/courseApi";
import { useUpdateProgressMutation } from "@/store/api/enrollmentApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { Skeleton } from "@/components/ui/skeleton";

// Lesson Player Component
export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // API queries
  const {
    data: lessonData,
    isLoading: isLoadingLesson,
    error: lessonError
  } = useGetLessonByIdQuery({ courseId, lessonId });

  const {
    data: lessonsData,
    isLoading: isLoadingLessons
  } = useGetLessonsQuery({ courseId, params: { limit: 100 } });

  const [updateProgress, { isLoading: isCompletingLesson }] = useUpdateProgressMutation();

  const lesson = lessonData?.data?.lesson;
  const lessons = [...(lessonsData?.data?.lessons || [])].sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0));

  // Find current lesson index and navigation
  const currentLessonIndex = lessons.findIndex((l: { _id: string }) => l._id === lessonId);
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

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
      // Get enrollment ID (this would need to be tracked in your state/context)
      // For now, we'll use the completeLesson endpoint from the backend
      await updateProgress({
        enrollmentId: "temp", // This should come from enrollment context
        data: {
          lessonId,
          timeSpent
        }
      }).unwrap();

      setIsCompleted(true);
      showSuccessToast("Lesson completed successfully!");
    } catch (error) {
      console.error("Error completing lesson:", error);
      showErrorToast("Failed to mark lesson as complete");
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
          <p className="text-gray-600 mb-4">The lesson you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {lesson.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Progress
                value={(currentLessonIndex + 1) / lessons.length * 100}
                className="w-32"
              />
              {!isCompleted && (
                <Button
                  onClick={handleCompleteLesson}
                  disabled={isCompletingLesson}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCompletingLesson ? (
                    "Completing..."
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <Card>
              <CardContent className="p-0">
                {renderLessonContent(lesson, isPlaying, setIsPlaying, currentTime, setCurrentTime, duration, setDuration)}
              </CardContent>
            </Card>

            {/* Lesson Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{lesson.title}</CardTitle>
                  <Badge variant={lesson.type === 'video' ? 'default' : 'secondary'}>
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                  </Badge>
                </div>
                {lesson.description && (
                  <p className="text-gray-600">{lesson.description}</p>
                )}
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
                      <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-4">
                    {lesson.resources && lesson.resources.length > 0 ? (
                      <div className="space-y-3">
                        {lesson.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ResourceIcon type={resource.type} />
                              <div>
                                <p className="font-medium">{resource.title}</p>
                                <p className="text-sm text-gray-500">{resource.type.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => window.open(resource.url, '_blank')}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                              {resource.downloadable && (
                                <Button size="sm" variant="outline" onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = resource.url;
                                  link.download = resource.title;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No resources available for this lesson.</p>
                    )}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handlePreviousLesson}
                  disabled={!previousLesson}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {previousLesson ? `Previous: ${previousLesson.title}` : "No Previous Lesson"}
                </Button>
                <Button
                  onClick={handleNextLesson}
                  disabled={!nextLesson}
                  className="w-full justify-start"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  {nextLesson ? `Next: ${nextLesson.title}` : "Course Complete!"}
                </Button>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Lessons Completed</span>
                    <span>{currentLessonIndex + (isCompleted ? 1 : 0)} / {lessons.length}</span>
                  </div>
                  <Progress value={(currentLessonIndex + (isCompleted ? 1 : 0)) / lessons.length * 100} />
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round((currentLessonIndex + (isCompleted ? 1 : 0)) / lessons.length * 100)}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lessons.map((l: { _id: string; title: string; estimatedDuration?: number }, index: number) => (
                    <button
                      key={l._id}
                      onClick={() => router.push(`/courses/${courseId}/lessons/${l._id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        l._id === lessonId
                          ? "bg-blue-100 border-blue-300 border"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            l._id === lessonId ? "text-blue-900" : "text-gray-900"
                          }`}>
                            {index + 1}. {l.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {l.type} • {l.duration || 0} min
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
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render lesson content based on type
function renderLessonContent(
  lesson: { content?: string | LessonContent[]; title: string; description?: string },
  isPlaying: boolean,
  setIsPlaying: (playing: boolean) => void,
  currentTime: number,
  setCurrentTime: (time: number) => void,
  duration: number,
  setDuration: (duration: number) => void
) {
  switch (lesson.type) {
    case 'video':
      return (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="aspect-video">
            {lesson.videoUrl ? (
              <video
                className="w-full h-full"
                controls
                onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Video content not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="p-8">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        </div>
      );

    case 'quiz':
      return (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Quiz Lesson</h3>
          <p className="text-gray-600 mb-6">This lesson contains a quiz. Click below to start.</p>
          <Button size="lg">
            Start Quiz
          </Button>
        </div>
      );

    case 'assignment':
      return (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Assignment</h3>
          <p className="text-gray-600 mb-6">This lesson contains an assignment to complete.</p>
          <Button size="lg" variant="outline">
            View Assignment
          </Button>
        </div>
      );

    default:
      return (
        <div className="p-8">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        </div>
      );
  }
}

// Helper function for resource icons
function ResourceIcon({ type }: { type: string }) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'video':
      return <Play className="h-5 w-5 text-blue-500" />;
    case 'link':
      return <ExternalLink className="h-5 w-5 text-green-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

// Loading skeleton component
function LessonPlayerSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}