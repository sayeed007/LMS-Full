"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ContentQuizQuestion } from "@/types/backend-models";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCcw,
  X,
} from "lucide-react";
import { useState } from "react";

interface EmbeddedQuizRendererProps {
  quizData: {
    instructions?: string;
    timeLimit?: number;
    attempts: number;
    shuffleQuestions: boolean;
    showFeedback: boolean;
    passingScore: number;
    questions: ContentQuizQuestion[];
  };
  onComplete: () => void;
}

export function EmbeddedQuizRenderer({
  quizData,
  onComplete,
}: EmbeddedQuizRendererProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleAnswerChange = (answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, index) => {
      totalPoints += q.points || 1;
      const userAnswer = answers[index];

      if (!userAnswer) return;

      if (q.type === "single_choice" || q.type === "pick_from_db") {
        const correctOption = q.options?.find((opt) => opt.isCorrect);
        // Compare with option text or maybe we need ID? Assuming text for now based on options usually being simple
        // Actually ContentQuizChoice has { text: string; isCorrect: boolean }
        // The value stored in answers is likely the text of the selected option
        if (correctOption && userAnswer === correctOption.text) {
          earnedPoints += q.points || 1;
        }
      } else if (q.type === "multiple_choice") {
        const correctOptions =
          q.options?.filter((opt) => opt.isCorrect).map((opt) => opt.text) ||
          [];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];

        // Check if arrays match (simple check)
        if (
          correctOptions.length === userAnswers.length &&
          correctOptions.every((opt) => userAnswers.includes(opt))
        ) {
          earnedPoints += q.points || 1;
        }
      } else if (q.type === "descriptive") {
        // Simple case-insensitive string match if expectedAnswer is provided
        if (
          q.expectedAnswer &&
          typeof userAnswer === "string" &&
          userAnswer.toLowerCase().trim() ===
            q.expectedAnswer.toLowerCase().trim()
        ) {
          earnedPoints += q.points || 1;
        }
      }
    });

    const finalPercentage =
      totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    setScore(finalPercentage);
    const isPassed = finalPercentage >= (quizData.passingScore || 0);
    setPassed(isPassed);
    setShowResults(true);

    if (isPassed) {
      onComplete();
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setPassed(false);
  };

  if (!hasStarted) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Time!</h3>
            <p className="text-gray-600">
              {quizData.questions.length} questions • Passing score:{" "}
              {quizData.passingScore}%
            </p>
          </div>
          {quizData.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
              <p className="text-blue-800 text-sm">{quizData.instructions}</p>
            </div>
          )}
          <Button
            onClick={handleStart}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="p-8 text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <X className="w-10 h-10 text-red-600" />
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {passed ? "Excellent!" : "Keep Trying"}
            </h3>
            <p className="text-gray-600">You scored {Math.round(score)}%</p>
          </div>

          <div className="flex justify-center gap-4">
            {!passed && (
              <Button
                onClick={handleRetake}
                variant="outline"
                className="min-w-[150px]"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            {passed && (
              <div className="text-green-600 font-medium flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Lesson Completed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure currentQuestion exists
  if (!currentQuestion) {
    return (
      <div className="text-center p-8 text-red-500">
        Error: Question data missing
      </div>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {quizData.timeLimit && (
              <span className="flex items-center text-orange-600">
                <Clock className="w-4 h-4 mr-1" />
                {Math.ceil(quizData.timeLimit / 60)} min limit
              </span>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 h3-question">
              {currentQuestion.question}
            </h3>
            {renderQuestionInput(
              currentQuestion,
              answers[currentQuestionIndex],
              handleAnswerChange
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={isFirstQuestion}
            className="text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={calculateScore}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Answers
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderQuestionInput(
  question: ContentQuizQuestion,
  currentAnswer: string | string[] | undefined,
  onChange: (answer: string | string[]) => void
) {
  // Mapping 'multiple-choice' to API 'multiple_choice' naming convention differences if any.
  // The type definition says 'single_choice' | 'multiple_choice' ...
  // Check backend-models.ts: type: 'single_choice' | 'multiple_choice' | 'descriptive' | 'pick_from_db';

  switch (question.type) {
    case "single_choice":
    case "pick_from_db": // Treating pick_from_db like single choice for now unless specified
      return (
        <RadioGroup
          value={typeof currentAnswer === "string" ? currentAnswer : ""}
          onValueChange={onChange}
          className="space-y-3"
        >
          {question.options?.map((option, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RadioGroupItem
                value={option.text}
                id={`opt-${index}`}
                className="mt-1"
              />
              <Label
                htmlFor={`opt-${index}`}
                className="flex-1 cursor-pointer font-normal text-gray-700"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "multiple_choice":
      return (
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isChecked =
              Array.isArray(currentAnswer) &&
              currentAnswer.includes(option.text);
            return (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`opt-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(currentAnswer)
                      ? currentAnswer
                      : [];
                    if (checked) {
                      onChange([...current, option.text]);
                    } else {
                      onChange(current.filter((item) => item !== option.text));
                    }
                  }}
                  className="mt-1"
                />
                <Label
                  htmlFor={`opt-${index}`}
                  className="flex-1 cursor-pointer font-normal text-gray-700"
                >
                  {option.text}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case "descriptive":
      return (
        <Textarea
          value={typeof currentAnswer === "string" ? currentAnswer : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[150px] resize-none"
        />
      );

    default:
      return (
        <div className="text-gray-500 italic">
          Unsupported question type: {question.type}
        </div>
      );
  }
}
