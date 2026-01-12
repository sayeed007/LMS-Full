"use client";

import { Container } from "@/components/ui";
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
import {
  QuestionPopulated,
  useGetQuestionsByQuestionBankQuery,
} from "@/store/api/questionApi";
import { useGetQuestionBankQuery } from "@/store/api/questionBankApi";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  LayoutDashboard,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuestionBankPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const questionBankId = params.id as string;

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    timeSpent: number;
  } | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [startTime] = useState<number>(Date.now());
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(0);

  // Per-question timer state: Record<QuestionId, SecondsRemaining>
  const [questionTimeLeft, setQuestionTimeLeft] = useState<
    Record<string, number>
  >({});

  // API queries
  const { data: questionBankData, isLoading: isLoadingBank } =
    useGetQuestionBankQuery(questionBankId);

  const { data: questionsData, isLoading: isLoadingQuestions } =
    useGetQuestionsByQuestionBankQuery({ questionBankId });

  const questionBank = questionBankData?.data?.questionBank;
  const questions = questionsData?.data?.questions || [];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const getSectionName = (sectionId?: string) => {
    if (!sectionId || !questionBank?.sections) return null;
    return questionBank.sections.find((s) => s._id === sectionId)?.name;
  };

  // Initialize global quiz timer based on settings
  useEffect(() => {
    // Check if time limit is set (defaultTimeLimit in minutes)
    const timeLimit = questionBank?.settings?.defaultTimeLimit ?? 0;

    if (timeLimit > 0) {
      setTimeLimitMinutes(timeLimit);
      setTimeLeft(timeLimit * 60);
    }
  }, [questionBank]);

  // Global Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz(); // Auto-submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showResults]);

  // Per-Question Persistent Timer Logic
  useEffect(() => {
    // Check if current question has a time limit
    if (
      !currentQuestion ||
      !currentQuestion._id ||
      !currentQuestion.timeLimit ||
      showResults
    )
      return;

    const qId = currentQuestion._id;
    const storageKey = `qb_preview_${questionBankId}_${qId}_expiry`;

    // Function to get or set expiry time in localStorage
    const getOrSetExpiry = () => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return parseInt(stored, 10);
      }
      const now = Date.now();
      // currentQuestion.timeLimit is in seconds as established
      const expiry = now + currentQuestion.timeLimit! * 1000;
      localStorage.setItem(storageKey, expiry.toString());
      return expiry;
    };

    const expiryTime = getOrSetExpiry();

    const updateTimer = () => {
      const now = Date.now();
      const remainingMs = expiryTime - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setQuestionTimeLeft((prev) => ({
        ...prev,
        [qId]: remainingSeconds,
      }));
    };

    // Immediate update
    updateTimer();

    // Interval to keep checking against expiry time
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showResults, questionBankId]);

  // Handle answer change
  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Toggle question flag
  const toggleQuestionFlag = (index: number) => {
    setFlaggedQuestions((prev) => {
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
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Check correctness locally for preview
  const checkAnswer = (
    question: QuestionPopulated,
    answer: string | string[]
  ) => {
    if (!question.choices || question.choices.length === 0) return false;

    const correctChoices = question.choices
      .filter((c) => c.isCorrect)
      .map((c) => c.text);

    if (Array.isArray(answer)) {
      // Multiple select
      if (answer.length !== correctChoices.length) return false;
      // Exact match logic
      return (
        answer.length === correctChoices.length &&
        answer.every((a) => correctChoices.includes(a))
      );
    } else {
      // Single choice / True False
      return correctChoices.includes(answer);
    }
  };

  // Submit quiz (Mock)
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);

    // Simulate calculation
    setTimeout(() => {
      let score = 0;
      let maxScore = 0;

      questions.forEach((q) => {
        maxScore += q.points || 1;
        const answer = answers[q._id];
        if (answer && checkAnswer(q, answer)) {
          score += q.points || 1;
        }
      });

      const percentage =
        maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      // Use passing score from settings (default to 50%)
      const passingScore = questionBank?.settings?.passingScore || 50;
      const isPassed = percentage >= passingScore;

      setQuizResults({
        score,
        maxScore,
        percentage,
        isPassed,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });

      setShowResults(true);
      setTimeLeft(null);
      setIsSubmitting(false);
    }, 1000);
  };

  // Clean up storage on restart
  const handleRestartPreview = () => {
    questions.forEach((q) => {
      localStorage.removeItem(`qb_preview_${questionBankId}_${q._id}_expiry`);
    });
    window.location.reload();
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Get question status
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question)
      return { hasAnswer: false, isFlagged: false, isCurrent: false };
    const hasAnswer = answers[question._id];
    const isFlagged = flaggedQuestions.has(index);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return "current";
    if (isFlagged) return "flagged";
    if (hasAnswer) return "answered";
    return "unanswered";
  };

  // Loading state
  if (isLoadingBank || isLoadingQuestions) {
    return <QuizTakingSkeleton />;
  }

  // Error state
  if (!questionBank || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Questions Found
          </h2>
          <p className="text-gray-600 mb-4">
            This question bank doesn&apos;t have any questions to preview.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults && quizResults) {
    return (
      <QuizResultsView
        results={quizResults}
        onRetakeQuiz={handleRestartPreview}
      />
    );
  }

  const currentQTimer = currentQuestion?._id
    ? questionTimeLeft[currentQuestion._id]
    : undefined;
  const isQuestionExpired = currentQTimer !== undefined && currentQTimer <= 0;

  // Main quiz interface
  return (
    <Container size="xl" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="w-full bg-yellow-50 border-b border-yellow-100 py-1.5 text-center text-xs text-yellow-800 font-medium tracking-wide">
          PREVIEW MODE • Results will not be saved
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 -ml-2"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline ml-1">Editor</span>
              </Button>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                  {questionBank.name}
                </h1>
                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  {timeLeft !== null && (
                    <span
                      className={`flex items-center gap-1 ${
                        timeLeft < 300
                          ? "text-red-600 font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end w-48">
                <div className="flex justify-between w-full text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={((currentQuestionIndex + 1) / questions.length) * 100}
                  className="h-2"
                />
              </div>

              <Button
                onClick={() => handleSubmitQuiz()}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 shadow-sm"
                size="sm"
              >
                {isSubmitting ? "Finishing..." : "Finish Preview"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Navigator & Info (Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 order-1">
            {/* Question Navigator */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-gray-500" />
                  Question Navigator
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`
                            h-9 w-full rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center
                            ring-1 ring-inset
                            ${
                              status === "current"
                                ? "bg-blue-600 text-white ring-blue-600 shadow-md transform scale-105 z-10"
                                : status === "answered"
                                ? "bg-green-50 text-green-700 ring-green-200 hover:bg-green-100"
                                : status === "flagged"
                                ? "bg-orange-50 text-orange-700 ring-orange-200 hover:bg-orange-100"
                                : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
                            }
                        `}
                      >
                        {index + 1}
                        {status === "flagged" && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full -mr-0.5 -mt-0.5 ring-2 ring-white"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                    <span>Not Visited</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Info / Settings */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  Quiz Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Timer className="w-4 h-4" /> Global Timer
                  </span>
                  <span className="font-semibold text-gray-900">
                    {timeLimitMinutes > 0
                      ? `${timeLimitMinutes} mins`
                      : "Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Attempts
                  </span>
                  <span className="font-semibold text-gray-900">
                    {!questionBank?.settings?.maxAttempts ||
                    questionBank?.settings?.maxAttempts === 0
                      ? "Unlimited"
                      : `${questionBank?.settings?.maxAttempts}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Passing Score
                  </span>
                  <span className="font-semibold text-gray-900">
                    {questionBank?.settings?.passingScore
                      ? `${questionBank.settings.passingScore}%`
                      : "-"}{" "}
                    {questionBank?.settings?.passingScoreRequired
                      ? "(Required)"
                      : ""}
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Answered Questions</span>
                    <span>
                      {Object.keys(answers).length} / {questions.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      (Object.keys(answers).length / questions.length) * 100
                    }
                    className="h-1.5 bg-gray-100"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Question Content */}
          <div className="lg:col-span-8 space-y-6 order-2">
            <Card className="border-gray-200 shadow-sm overflow-hidden relative">
              {/* Question Blocking Overlay if Expired */}
              {isQuestionExpired && (
                <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-8">
                  <Clock className="w-16 h-16 text-red-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Time Expired
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    The time limit for this question has been reached. You can
                    no longer modify your answer.
                  </p>
                  <Button onClick={goToNextQuestion} className="mt-6">
                    Move to Next Question
                  </Button>
                </div>
              )}

              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {currentQuestion.bankSection &&
                      getSectionName(currentQuestion.bankSection) && (
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                          {getSectionName(currentQuestion.bankSection)}
                        </div>
                      )}
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      Question {currentQuestionIndex + 1}
                      {currentQuestion.points && (
                        <Badge
                          variant="secondary"
                          className="font-normal text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          {currentQuestion.points} Points
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="font-normal text-xs text-gray-500 border-gray-300"
                      >
                        {currentQuestion.type === "multiple-choice"
                          ? "Multiple Choice"
                          : currentQuestion.type === "single-choice"
                          ? "Single Choice"
                          : currentQuestion.type === "true-false"
                          ? "True / False"
                          : currentQuestion.type}
                      </Badge>
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Per Question Timer Display */}
                    {currentQTimer !== undefined && (
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm border
                             ${
                               currentQTimer <= 10
                                 ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                                 : "bg-blue-50 text-blue-700 border-blue-200"
                             }
                        `}
                      >
                        <Timer className="w-4 h-4" />
                        {formatTime(currentQTimer)}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleQuestionFlag(currentQuestionIndex)}
                      className={`rounded-full transition-colors ${
                        flaggedQuestions.has(currentQuestionIndex)
                          ? "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      }`}
                      title={
                        flaggedQuestions.has(currentQuestionIndex)
                          ? "Unflag Question"
                          : "Flag for Review"
                      }
                    >
                      <Flag
                        className={`h-5 w-5 ${
                          flaggedQuestions.has(currentQuestionIndex)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-8">
                {currentQuestion && (
                  <>
                    <div className="prose prose-lg max-w-none text-gray-800">
                      <p className="leading-relaxed font-medium">
                        {currentQuestion.text}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Your Answer
                      </Label>
                      {renderQuestionInput(
                        currentQuestion,
                        answers[currentQuestion._id],
                        (answer) =>
                          handleAnswerChange(currentQuestion._id, answer),
                        isQuestionExpired
                      )}
                    </div>
                  </>
                )}

                <div className="pt-8 flex items-center justify-between gap-4 border-t border-gray-100 mt-8">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={isFirstQuestion}
                    className="w-[120px] justify-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex-1 text-center text-sm text-gray-400 hidden sm:block">
                    Use navigation to move between questions
                  </div>

                  {isLastQuestion ? (
                    <Button
                      onClick={() => handleSubmitQuiz()}
                      disabled={isSubmitting}
                      className="w-[120px] justify-center bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmitting ? "..." : "Finish"}
                    </Button>
                  ) : (
                    <Button
                      onClick={goToNextQuestion}
                      className="w-[120px] justify-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

// Helper function to render different question types
function renderQuestionInput(
  question: QuestionPopulated,
  currentAnswer: string | string[] | undefined,
  onChange: (answer: string | string[]) => void,
  disabled: boolean = false
) {
  // Use 'type' instead of 'questionType' as per QuestionPopulated interface
  switch (question.type) {
    case "single-choice":
    case "true-false": // Handling true-false as radio too
      return (
        <RadioGroup
          value={typeof currentAnswer === "string" ? currentAnswer : ""}
          onValueChange={onChange}
          className="space-y-3"
          disabled={disabled}
        >
          {question.choices?.map((choice, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                disabled
                  ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-100"
                  : currentAnswer === choice.text
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem
                value={choice.text}
                id={`option-${index}`}
                className="text-blue-600 border-gray-300"
                disabled={disabled}
              />
              <Label
                htmlFor={`option-${index}`}
                className={`flex-1 font-medium text-gray-700 ${
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {choice.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "multiple-choice":
      return (
        <div className="space-y-3">
          {question.choices?.map((choice, index) => {
            const isChecked =
              Array.isArray(currentAnswer) &&
              currentAnswer.includes(choice.text);
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  disabled
                    ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-100"
                    : isChecked
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  id={`option-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(currentAnswer)
                      ? currentAnswer
                      : [];
                    if (checked) {
                      onChange([...current, choice.text]);
                    } else {
                      onChange(current.filter((item) => item !== choice.text));
                    }
                  }}
                  disabled={disabled}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300"
                />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-1 font-medium text-gray-700 ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {choice.text}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case "descriptive":
    case "fill-blank":
      return question.type === "fill-blank" ? (
        <Input
          value={typeof currentAnswer === "string" ? currentAnswer : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer here..."
          className="w-full text-lg p-4 h-14"
          disabled={disabled}
        />
      ) : (
        <Textarea
          value={typeof currentAnswer === "string" ? currentAnswer : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your detailed answer here..."
          className="w-full min-h-[200px] text-lg p-4 resize-y"
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Preview for question type &apos;{question.type}&apos; is not fully
          supported yet.
        </div>
      );
  }
}

// Quiz results view component (Mock)
function QuizResultsView({
  results,
  onRetakeQuiz,
}: {
  results: {
    isPassed: boolean;
    percentage: number;
    score: number;
    maxScore: number;
    timeSpent: number;
  };
  onRetakeQuiz: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <Card className="shadow-lg border-0 overflow-hidden">
          <div
            className={`h-2 w-full ${
              results.isPassed ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <CardHeader className="text-center pb-2 pt-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                results.isPassed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {results.isPassed ? (
                <Trophy className="h-10 w-10" />
              ) : (
                <X className="h-10 w-10" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {results.isPassed ? "Preview Passed!" : "Needs Practice"}
            </CardTitle>
            <p className="text-gray-600 mt-2 text-lg">
              {results.isPassed
                ? "Great job demonstrating knowledge."
                : "Don't give up, try again!"}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Score display */}
            <div className="text-center bg-gray-50 p-6 rounded-2xl">
              <div className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
                {results.percentage}%
              </div>
              <p className="font-medium text-gray-500">
                {results.score} out of {results.maxScore} points
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}
                  s
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                  Time Spent
                </div>
              </div>
              <div className="text-center p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-xl font-bold text-gray-900">50%</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                  Pass Score
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
              >
                Back to Editor
              </Button>
              <Button
                onClick={onRetakeQuiz}
                className="h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-transform"
              >
                Restart Preview
              </Button>
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
