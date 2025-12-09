"use client";

import { QuestionEditor } from "@/components/question-bank/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { Question } from "@/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface QuizCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quizData: QuizData) => void;
  initialData?: QuizData;
}

export interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number; // in minutes
  allowRetakes: boolean;
  showResults: boolean;
}

const initialQuizData: QuizData = {
  title: "",
  description: "",
  questions: [],
  passingScore: 70,
  timeLimit: 0,
  allowRetakes: true,
  showResults: true,
};

const questionTypes = [
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'descriptive', label: 'Descriptive' },
];

export function QuizCreationModal({ isOpen, onClose, onSave, initialData }: QuizCreationModalProps) {
  const [quizData, setQuizData] = useState<QuizData>(initialData || initialQuizData);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  if (!isOpen) return null;

  const createQuestion = (type: string): Question => {
    const baseQuestion: Question = {
      _id: `question-${Date.now()}`,
      type: type as Question['type'],
      text: '',
      choices: [],
      difficulty: 'medium',
      points: 2,
      timeLimit: 0,
      tags: [],
      attachments: [],
      questionBank: '',
      course: '',
      section: '',
      createdBy: '',
      isActive: true,
      isPublic: false,
      timesUsed: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add default choices for choice-based questions
    if (type === 'single-choice' || type === 'multiple-choice') {
      baseQuestion.choices = [
        { _id: `choice-${Date.now()}-1`, text: '', isCorrect: false },
        { _id: `choice-${Date.now()}-2`, text: '', isCorrect: false }
      ];
    }

    return baseQuestion;
  };

  const handleAddQuestion = (type: string) => {
    const newQuestion = createQuestion(type);
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });
    setShowAddQuestion(false);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map(q =>
        q._id === updatedQuestion._id ? updatedQuestion : q
      )
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(q => q._id !== questionId)
    });
  };

  const handleSave = () => {
    if (!quizData.title.trim()) {
      showErrorToast("Quiz title is required");
      return;
    }

    if (quizData.questions.length === 0) {
      showErrorToast("At least one question is required");
      return;
    }

    // Validate that all questions have content
    const invalidQuestions = quizData.questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      showErrorToast("All questions must have content");
      return;
    }

    // Validate choice questions have at least one correct answer
    const choiceQuestions = quizData.questions.filter(q =>
      q.type === 'single-choice' || q.type === 'multiple-choice'
    );

    const questionsWithoutCorrectAnswer = choiceQuestions.filter(q =>
      !q.choices?.some(c => c.isCorrect)
    );

    if (questionsWithoutCorrectAnswer.length > 0) {
      showErrorToast("All choice questions must have at least one correct answer");
      return;
    }

    onSave(quizData);
    showSuccessToast("Quiz saved successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create Quiz</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quiz Settings */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quiz Title *</label>
              <Input
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                placeholder="Enter quiz title"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                placeholder="Enter quiz description"
                className="w-full border rounded-md px-3 py-2 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                <Input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 0 })}
                  placeholder="70"
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (minutes, 0 = no limit)</label>
                <Input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quizData.allowRetakes}
                  onChange={(e) => setQuizData({ ...quizData, allowRetakes: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Allow Retakes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quizData.showResults}
                  onChange={(e) => setQuizData({ ...quizData, showResults: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Show Results After Completion</span>
              </label>
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Questions ({quizData.questions.length})</h3>
              <Button
                onClick={() => setShowAddQuestion(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {/* Add Question Type Selection */}
            {showAddQuestion && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Select Question Type</h4>
                <div className="grid grid-cols-3 gap-3">
                  {questionTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      onClick={() => handleAddQuestion(type.value)}
                      className="p-4 h-auto flex flex-col items-center justify-center"
                    >
                      <span className="text-sm font-medium">{type.label}</span>
                    </Button>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddQuestion(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={question._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm text-gray-600">
                      Question {index + 1} - {question.type}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question._id || question.id || '')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <QuestionEditor
                    question={question}
                    onUpdate={handleUpdateQuestion}
                    onDelete={() => handleDeleteQuestion(question._id || question.id || '')}
                  />
                </div>
              ))}

              {quizData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={!quizData.title.trim() || quizData.questions.length === 0}
          >
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}