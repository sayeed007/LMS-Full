"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { useGetQuizAttemptsQuery, useGetQuizByIdQuery, useStartQuizAttemptMutation, useSubmitQuizMutation } from "@/store/api/quizApi";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Flag, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Quiz Taking Interface
export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // API queries and mutations
  const {
    data: quizData,
    isLoading: isLoadingQuiz,
    error: quizError
  } = useGetQuizByIdQuery(quizId);

  const {
    data: attemptsData
  } = useGetQuizAttemptsQuery(quizId);

  const [startQuizAttempt, { isLoading: isStartingQuiz }] = useStartQuizAttemptMutation();
  const [submitQuiz, { isLoading: isSubmittingQuiz }] = useSubmitQuizMutation();

  const quiz = quizData?.data?.quiz;
  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && attemptId && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz(true); // Auto-submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, attemptId, showResults]);

  // Start quiz attempt
  const handleStartQuiz = async () => {
    try {
      const response = await startQuizAttempt(quizId).unwrap();
      setAttemptId(response.data?.attemptId || null);
      if (response.data?.timeRemaining) {
        setTimeLeft(response.data.timeRemaining);
      }
      showSuccessToast("Quiz started successfully!");
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to start quiz");
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Toggle question flag
  const toggleQuestionFlag = (index: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Navigation helpers
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!attemptId) return;

    setIsSubmitting(true);
    try {
      const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await submitQuiz({
        quizId,
        attemptId,
        answers: submissionAnswers
      }).unwrap();

      setQuizResults(response.data?.result);
      setShowResults(true);
      setTimeLeft(null);

      if (autoSubmit) {
        showErrorToast("Time's up! Quiz auto-submitted.");
      } else {
        showSuccessToast("Quiz submitted successfully!");
      }
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get question status
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) return { hasAnswer: false, isFlagged: false, isCurrent: false };
    const questionId = typeof question === 'string' ? question : question?._id;
    const hasAnswer = questionId && answers[questionId];
    const isFlagged = flaggedQuestions.has(index);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  // Loading state
  if (isLoadingQuiz) {
    return <QuizTakingSkeleton />;
  }

  // Error state
  if (quizError || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults && quizResults) {
    return <QuizResultsView quiz={quiz} results={quizResults} onRetakeQuiz={() => window.location.reload()} />;
  }

  // Quiz hasn't started yet
  if (!attemptId) {
    return <QuizIntroView quiz={quiz} attempts={attemptsData?.data?.attempts || []} onStartQuiz={handleStartQuiz} isStarting={isStartingQuiz} />;
  }

  // Main quiz interface
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
                <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {timeLeft !== null && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                </div>
              )}
              <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Question {currentQuestionIndex + 1}
                    {typeof currentQuestion === 'object' && currentQuestion?.points && (
                      <Badge variant="secondary" className="ml-2">
                        {currentQuestion.points} pts
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQuestionFlag(currentQuestionIndex)}
                    className={flaggedQuestions.has(currentQuestionIndex) ? "text-orange-600" : "text-gray-400"}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuestion && (
                  <>
                    <div className="prose max-w-none">
                      <p className="text-lg text-gray-900">
                        {typeof currentQuestion === 'object' ? currentQuestion.questionText || currentQuestion.text : 'Question text not available'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {typeof currentQuestion === 'object' && renderQuestionInput(
                        currentQuestion,
                        answers[currentQuestion._id],
                        (answer) =>
                          handleAnswerChange(currentQuestion._id, answer)
                      )}
                    </div>
                  </>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={isFirstQuestion}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    {isLastQuestion ? (
                      <Button
                        onClick={() => handleSubmitQuiz()}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Quiz"}
                      </Button>
                    ) : (
                      <Button onClick={goToNextQuestion}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${status === 'current'
                            ? 'bg-blue-600 text-white'
                            : status === 'answered'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : status === 'flagged'
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Questions:</span>
                  <span className="text-sm font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Answered:</span>
                  <span className="text-sm font-medium">
                    {Object.keys(answers).length} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Flagged:</span>
                  <span className="text-sm font-medium">{flaggedQuestions.size}</span>
                </div>
                {quiz.passingScore && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Passing Score:</span>
                    <span className="text-sm font-medium">{quiz.passingScore}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render different question types
function renderQuestionInput(question: any, currentAnswer: any, onChange: (answer: any) => void) {
  switch (question.questionType) {
    case 'multiple_choice':
      return (
        <RadioGroup value={currentAnswer || ""} onValueChange={onChange}>
          {question.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'multiple_select':
      return (
        <div className="space-y-3">
          {question.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                onCheckedChange={(checked) => {
                  const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                  if (checked) {
                    onChange([...current, option]);
                  } else {
                    onChange(current.filter((item: string) => item !== option));
                  }
                }}
              />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      );

    case 'true_false':
      return (
        <RadioGroup value={currentAnswer || ""} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true" className="cursor-pointer">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false" className="cursor-pointer">False</Label>
          </div>
        </RadioGroup>
      );

    case 'short_answer':
      return (
        <Input
          value={currentAnswer || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer..."
          className="w-full"
        />
      );

    case 'essay':
      return (
        <Textarea
          value={currentAnswer || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your essay here..."
          className="w-full min-h-32"
        />
      );

    default:
      return (
        <div className="text-center py-8 text-gray-500">
          Unsupported question type: {question.questionType}
        </div>
      );
  }
}

// Quiz intro view component
function QuizIntroView({ quiz, attempts, onStartQuiz, isStarting }: any) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{quiz.questions?.length || 0}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {quiz.settings?.timeLimit || 'No limit'}
                </div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                <p className="text-blue-800 text-sm">{quiz.instructions}</p>
              </div>
            )}

            {/* Previous attempts */}
            {attempts && attempts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Previous Attempts:</h4>
                <div className="space-y-2">
                  {attempts.slice(0, 3).map((attempt: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Attempt {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{attempt.percentage}%</span>
                        <Badge className={attempt.isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {attempt.isPassed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={onStartQuiz}
                disabled={isStarting}
                className="flex-1"
              >
                {isStarting ? "Starting..." : "Start Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Quiz results view component
function QuizResultsView({ quiz, results, onRetakeQuiz }: any) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${results.isPassed ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {results.isPassed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <X className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {results.isPassed ? "Congratulations!" : "Quiz Completed"}
            </CardTitle>
            <p className="text-gray-600">
              {results.isPassed ? "You passed the quiz!" : "You can try again to improve your score."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score display */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {results.percentage}%
              </div>
              <p className="text-gray-600">
                {results.score} out of {results.maxScore} points
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{quiz.passingScore || 'N/A'}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Back to Course
              </Button>
              {!results.isPassed && (
                <Button
                  onClick={onRetakeQuiz}
                  className="flex-1"
                >
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading skeleton
function QuizTakingSkeleton() {
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
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="w-10 h-10" />
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