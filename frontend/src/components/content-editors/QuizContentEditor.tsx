import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useModal } from "@/lib/modal-context";
import { useParams } from "next/navigation";
import QuestionBankEditor from "@/components/question-bank/QuestionBankEditor";
import QuestionBankSelector from "@/components/quiz/QuestionBankSelector";
import SectionSelector from "@/components/quiz/SectionSelector";
import CreateBankModal from "@/components/quiz/CreateBankModal";
import CreateQuizModal from "@/components/quiz/CreateQuizModal";
import CreateSectionModal from "@/components/quiz/CreateSectionModal";
import { QuestionPopulated } from "@/store/api/questionApi";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByIdQuery,
} from "@/store/api/quizApi";
import {
  useGetQuestionBankQuery,
  useGetQuestionBanksByCourseQuery,
  useCreateQuestionBankMutation,
  useAddSectionMutation,
} from "@/store/api/questionBankApi";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from "@/store/api/questionApi";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { Question } from "@/types/backend-models";
import { LessonContent } from "@/types/content-editor";

interface QuizContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function QuizContentEditor({
  content,
  onChange,
}: QuizContentEditorProps) {
  const { openModal, closeModal } = useModal();
  const params = useParams();
  const courseId = params?.course_id as string;

  // Quiz state
  const [quizId, setQuizId] = useState<string | null>(
    content.data?.quizId || null
  );
  const [quizTitle, setQuizTitle] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");

  // Question Bank state
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  // API hooks
  const [createQuiz] = useCreateQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [createBank] = useCreateQuestionBankMutation();
  const [addSection] = useAddSectionMutation();

  // Fetch quiz data if editing
  const { data: quizData, isLoading: isLoadingQuiz } = useGetQuizByIdQuery(
    quizId!,
    {
      skip: !quizId,
    }
  );

  // Fetch question banks for the course
  const { data: banksData } = useGetQuestionBanksByCourseQuery({ courseId });

  // Fetch selected question bank
  const { data: bankData } = useGetQuestionBankQuery(selectedBankId!, {
    skip: !selectedBankId,
  });

  const questionBank = bankData?.data?.questionBank;
  const sections = questionBank?.sections || [];

  // Questions from quiz
  const [questions, setQuestions] = useState<QuestionPopulated[]>([]);

  // Track modified questions
  const [modifiedQuestionsMap] = useState<Map<string, QuestionPopulated>>(
    new Map()
  );

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState({
    passingScore: 70,
    attempts: 3,
    shuffleQuestions: false,
    showFeedback: true,
  });

  // Auto-select default bank and section when quiz loads
  useEffect(() => {
    if (quizId && banksData?.data?.questionBanks && !selectedBankId) {
      const banks = banksData.data.questionBanks;
      // Find default bank or use first one
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const defaultBank =
        banks.find((b: any) => b.name.includes("Course Quizzes")) || banks[0];

      if (defaultBank) {
        setSelectedBankId(defaultBank._id);

        // Auto-select first section (usually "General")
        if (defaultBank.sections && defaultBank.sections.length > 0) {
          setSelectedSectionId(defaultBank.sections[0]._id);
        }
      }
    }
  }, [quizId, banksData, selectedBankId]);

  // Sync quizId from content prop when it changes
  useEffect(() => {
    if (content.data?.quizId && content.data.quizId !== quizId) {
      setQuizId(content.data.quizId);
    }
  }, [content.data?.quizId, quizId]);

  // Load quiz data when available (either from API or embedded content)
  useEffect(() => {
    // Priority 1: Data from API (if quizId exists)
    if (quizData?.data?.quiz) {
      const quiz = quizData.data.quiz;
      setQuizTitle(quiz.title || "");
      setQuizInstructions(quiz.instructions || "");

      // Correctly map backend settings structure to local state
      // Backend settings are inside quiz.settings object
      const settings = quiz.settings as any;
      setQuizSettings({
        passingScore: settings?.passingScore ?? 70,
        attempts: settings?.maxAttempts ?? 3,
        shuffleQuestions: settings?.randomizeQuestions ?? false,
        showFeedback: settings?.showCorrectAnswers ?? true,
      });

      // Transform questions to QuestionPopulated format
      if (quiz.questions) {
        const transformedQuestions = quiz.questions.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (q: any) =>
            ({
              ...q,
              questionBank: q.questionBank || { _id: "temp", name: "Quiz" },
              createdBy: q.createdBy || {
                _id: "temp",
                name: "User",
                email: "user@example.com",
              },
              attachments: q.attachments || [],
              isPublic: q.isPublic || false,
              timesUsed: q.timesUsed || 0,
              averageScore: q.averageScore || 0,
              isActive: true,
            } as QuestionPopulated)
        );
        setQuestions(transformedQuestions);
      }
    }
    // Priority 2: Embedded data from content (if no quizId but data exists)
    else if (!quizId && content.data?.quiz) {
      const quiz = content.data.quiz;
      setQuizTitle(quiz.title || "");
      setQuizInstructions(quiz.instructions || "");

      // Map embedded settings
      setQuizSettings({
        passingScore: quiz.passingScore || 70,
        attempts: quiz.attempts || 3,
        shuffleQuestions: quiz.shuffleQuestions || false,
        showFeedback: quiz.showFeedback || true,
      });

      // Map embedded questions
      if (quiz.questions) {
        // Map type from underscore format to hyphen format (e.g., single_choice -> single-choice)
        const mapQuestionType = (type: string): Question["type"] => {
          const typeMap: Record<string, Question["type"]> = {
            single_choice: "single-choice",
            multiple_choice: "multiple-choice",
            true_false: "true-false",
            fill_blank: "fill-blank",
          };
          return typeMap[type] || (type as Question["type"]);
        };

        const transformedQuestions = quiz.questions.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (q: any, index: number) =>
            ({
              _id: q._id || `temp-q-${index}`,
              text: q.question || "", // embedded uses 'question', backend uses 'text'
              type: mapQuestionType(q.type || "single_choice"),
              choices: q.options || [],
              points: q.points || 1,
              timeLimit: q.timeLimit || 60,
              explanation: q.explanation || "",
              tags: [],
              difficulty: "medium",
              questionBank: { _id: "temp", name: "Embedded Quiz" },
              createdBy: {
                _id: "temp",
                name: "User",
                email: "user@example.com",
              },
              attachments: [],
              isPublic: false,
              timesUsed: 0,
              averageScore: 0,
              isActive: true,
              answers: [], // Missing in embedded usually
            } as unknown as QuestionPopulated)
        );
        setQuestions(transformedQuestions);
      }
    }
  }, [quizData, quizId, content.data?.quiz]);

  const handleCreateQuizWithTitle = async (title: string) => {
    try {
      const lessonId = params?.lesson_id as string;

      const result = await createQuiz({
        title: title,
        course: courseId,
        lesson: lessonId,
        questions: [],
        settings: {
          // Important: Send logic here to initial creation too
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: false,
          showCorrectAnswers: true,
        },
      }).unwrap();

      if (!result.data?.quiz?._id) {
        throw new Error("Quiz creation failed - no quiz ID returned");
      }

      const newQuizId = result.data.quiz._id;
      setQuizId(newQuizId);

      // Update content with quiz reference
      onChange({
        ...content,
        title: title,
        data: { quizId: newQuizId },
      });

      showSuccessToast("Quiz created and linked successfully!");
    } catch (error: any) {
      showErrorToast(
        error?.data?.message || error?.message || "Failed to create quiz"
      );
    }
  };

  const handleAddQuestion = async (type?: string) => {
    // Linked Quiz Mode
    let bankId = selectedBankId;
    let sectionId = selectedSectionId;

    if (!bankId || !sectionId) {
      try {
        if (!bankId) {
          const bankResult = await createBank({
            name: "Course Quizzes",
            description: "Default question bank for course quizzes",
            course: courseId,
          }).unwrap();

          bankId = bankResult.data.questionBank._id;
          setSelectedBankId(bankId);
        }

        if (!sectionId && bankId) {
          const sectionResult = await addSection({
            id: bankId,
            data: {
              name: "General",
              description: "General questions",
            },
          }).unwrap();

          if (sectionResult.data?.questionBank?.sections) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newSection = sectionResult.data.questionBank.sections.find(
              (s: any) => s.name === "General"
            );
            if (newSection) {
              sectionId = newSection._id;
              setSelectedSectionId(sectionId);
            }
          }
        }
      } catch (error: any) {
        showErrorToast(
          error?.data?.message || "Failed to create default bank/section"
        );
        return;
      }
    }

    if (!quizId) {
      // Fallback for Embedded Mode
      const questionType = (type as Question["type"]) || "single-choice";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newQuestion: any = {
        _id: `temp-${Date.now()}`,
        text: "New Question",
        type: questionType,
        choices:
          questionType === "true-false"
            ? [
                { text: "True", isCorrect: true, _id: `opt-${Date.now()}-1` },
                { text: "False", isCorrect: false, _id: `opt-${Date.now()}-2` },
              ]
            : [
                {
                  text: "Option A",
                  isCorrect: true,
                  _id: `opt-${Date.now()}-1`,
                },
                {
                  text: "Option B",
                  isCorrect: false,
                  _id: `opt-${Date.now()}-2`,
                },
              ],
        points: 1,
        timeLimit: 60,
        tags: [],
        difficulty: "medium",
        isRequired: true,
      };

      const newQuestions = [...questions, newQuestion];
      setQuestions(newQuestions);

      onChange({
        ...content,
        title: quizTitle || content.title,
        data: {
          ...content.data,
          quiz: {
            ...content.data?.quiz,
            questions: newQuestions.map((q: any, index: number) => ({
              ...q,
              question: q.text,
              type: q.type.replace(/-/g, "_"),
              order: index + 1,
              options: q.choices,
            })),
          },
        },
      });
      return;
    }

    try {
      const questionType = (type as Question["type"]) || "single-choice";
      const result = await createQuestion({
        text: "New Question",
        type: questionType,
        choices:
          questionType === "true-false"
            ? [
                { text: "True", isCorrect: true },
                { text: "False", isCorrect: false },
              ]
            : [
                { text: "Option A", isCorrect: true },
                { text: "Option B", isCorrect: false },
              ],
        points: 1,
        timeLimit: 60,
        tags: [],
        difficulty: "medium",
        questionBank: bankId!,
        bankSection: sectionId!,
      }).unwrap();

      const newQuestion = result.data.question;

      // Add question to quiz
      await updateQuiz({
        id: quizId,
        data: {
          questions: [...questions.map((q) => q._id), newQuestion._id],
        },
      }).unwrap();

      // Ensure type alignment for local state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const populatedQuestion: QuestionPopulated = {
        ...newQuestion,
        questionBank: newQuestion.questionBank || {
          _id: bankId!,
          name: "Question Bank",
        },
        // createdBy is already populated by API
        attachments: newQuestion.attachments || [],
      } as QuestionPopulated;

      setQuestions([...questions, populatedQuestion]);
      showSuccessToast("Question added");
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to add question");
    }
  };

  const handleUpdateQuestion = async (updatedQuestion: QuestionPopulated) => {
    // Update local state first
    const newQuestions = questions.map((q) =>
      q._id === updatedQuestion._id ? updatedQuestion : q
    );
    setQuestions(newQuestions);

    // Propagate to parent (ensure compatibility with embedded format)
    onChange({
      ...content,
      data: {
        ...content.data,
        quiz: {
          ...content.data?.quiz,
          questions: newQuestions.map((q: any, index: number) => ({
            ...q,
            question: q.text,
            type: q.type.replace(/-/g, "_"),
            order: index + 1,
            options: q.choices,
            points: q.points,
          })),
        },
      },
    });

    if (!quizId) return;

    try {
      await updateQuestion({
        id: updatedQuestion._id,
        data: {
          text: updatedQuestion.text,
          type: updatedQuestion.type,
          choices: updatedQuestion.choices,
          points: updatedQuestion.points,
          timeLimit: updatedQuestion.timeLimit,
          explanation: updatedQuestion.explanation,
          tags: updatedQuestion.tags,
          difficulty: updatedQuestion.difficulty,
          correctAnswer: updatedQuestion.correctAnswer,
        },
      }).unwrap();
    } catch (error: any) {
      console.error("Failed to update question", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    // Update local state
    const newQuestions = questions.filter((q) => q._id !== id);
    setQuestions(newQuestions);

    // Propagate to parent
    onChange({
      ...content,
      data: {
        ...content.data,
        quiz: {
          ...content.data?.quiz,
          questions: newQuestions.map((q: any, index: number) => ({
            ...q,
            question: q.text,
            type: q.type.replace(/-/g, "_"),
            order: index + 1,
            options: q.choices,
          })),
        },
      },
    });

    if (!quizId) {
      showSuccessToast("Question removed");
      return;
    }

    try {
      // Remove from quiz first
      await updateQuiz({
        id: quizId,
        data: {
          questions: newQuestions.map((q) => q._id),
        },
      }).unwrap();

      showSuccessToast("Question removed");
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to remove question");
    }
  };

  const handleSettingChange = (key: string, value: number | boolean) => {
    setQuizSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Modified to accept updated values directly to avoid state race conditions
  const handleSaveSettings = async (updates?: {
    title: string;
    instructions: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: any;
  }) => {
    // Use passed updates or fallback to state
    const title = updates?.title ?? quizTitle;
    const instructions = updates?.instructions ?? quizInstructions;
    const settings = updates?.settings ?? quizSettings;

    // Update local state
    if (updates) {
      setQuizTitle(title);
      setQuizInstructions(instructions);
      setQuizSettings(settings);
    }

    const finalSettings = {
      passingScore: settings.passingScore,
      maxAttempts: settings.attempts,
      randomizeQuestions: settings.shuffleQuestions,
      showCorrectAnswers: settings.showFeedback,
    };

    // Propagate to parent (Embedded & Freshness)
    onChange({
      ...content,
      title: title,
      data: {
        ...content.data,
        quiz: {
          ...content.data?.quiz,
          passingScore: settings.passingScore,
          attempts: settings.attempts,
          shuffleQuestions: settings.shuffleQuestions,
          showFeedback: settings.showFeedback,
          // Sync questions too to be safe
          questions: questions.map((q: any, index: number) => ({
            ...q,
            question: q.text,
            type: q.type.replace(/-/g, "_"),
            order: index + 1,
            options: q.choices,
          })),
        },
      },
    });

    if (!quizId) {
      showSuccessToast("Quiz settings saved locally");
      return;
    }

    try {
      await updateQuiz({
        id: quizId,
        data: {
          title: title,
          instructions: instructions,
          settings: finalSettings, // IMPORTANT: Send nested settings object to backend
        },
      }).unwrap();

      showSuccessToast("Quiz settings saved");
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to save settings");
    }
  };

  const handleOpenSettings = () => {
    const modalId = openModal(
      <QuizSettingsModal
        quizTitle={quizTitle}
        quizInstructions={quizInstructions}
        quizSettings={quizSettings}
        onTitleChange={setQuizTitle}
        onInstructionsChange={setQuizInstructions}
        onSettingChange={handleSettingChange}
        onSave={(data) => {
          handleSaveSettings(data);
          closeModal(modalId);
        }}
        onClose={() => closeModal(modalId)}
      />,
      {
        size: "2xl",
        position: "center",
      }
    );
  };

  const handleCreateBank = () => {
    const modalId = openModal(
      <CreateBankModal
        courseId={courseId}
        onSuccess={(bankId) => {
          setSelectedBankId(bankId);
          closeModal(modalId);
        }}
      />,
      {
        size: "md",
        position: "center",
      }
    );
  };

  const handleCreateSection = () => {
    if (!selectedBankId) {
      showErrorToast("Please select a question bank first");
      return;
    }

    const modalId = openModal(
      <CreateSectionModal
        questionBankId={selectedBankId}
        onSuccess={(sectionId) => {
          setSelectedSectionId(sectionId);
          closeModal(modalId);
        }}
      />,
      {
        size: "md",
        position: "center",
      }
    );
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading quiz...</div>
      </div>
    );
  }

  // Empty state - no quiz created yet AND no embedded data
  if (!quizId && !content.data?.quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Create Your Quiz
          </h3>
          <p className="text-gray-600">
            Get started by creating a quiz. You&apos;ll be able to add
            questions, configure settings, and organize questions using question
            banks.
          </p>
          <Button
            onClick={() => {
              const modalId = openModal(
                <CreateQuizModal
                  onConfirm={(title) => {
                    closeModal(modalId);
                    handleCreateQuizWithTitle(title);
                  }}
                />,
                {
                  size: "md",
                  position: "center",
                }
              );
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Settings Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quiz Questions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {questions.length} question{questions.length !== 1 ? "s" : ""} •
            Passing Score: {quizSettings.passingScore}%
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSettings}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Quiz Settings
        </Button>
      </div>

      {/* Question Bank and Section Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-0">
        <QuestionBankSelector
          courseId={courseId}
          value={selectedBankId}
          onChange={(bankId) => {
            setSelectedBankId(bankId);
            setSelectedSectionId(null); // Reset section when bank changes
          }}
          onCreateNew={handleCreateBank}
        />

        <SectionSelector
          sections={sections}
          value={selectedSectionId}
          onChange={(sectionId) => setSelectedSectionId(sectionId)}
          onCreateNew={handleCreateSection}
          disabled={!selectedBankId}
        />
      </div>

      {/* Questions Section */}
      <QuestionBankEditor
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        modifiedQuestionsMap={modifiedQuestionsMap}
      />
    </div>
  );
}

// Quiz Settings Modal Component
interface QuizSettingsModalProps {
  quizTitle: string;
  quizInstructions: string;
  quizSettings: {
    passingScore: number;
    attempts: number;
    shuffleQuestions: boolean;
    showFeedback: boolean;
  };
  onTitleChange: (title: string) => void;
  onInstructionsChange: (instructions: string) => void;
  onSettingChange: (key: string, value: number | boolean) => void;
  onSave: (data: {
    title: string;
    instructions: string;
    settings: {
      passingScore: number;
      attempts: number;
      shuffleQuestions: boolean;
      showFeedback: boolean;
    };
  }) => void;
  onClose?: () => void;
}

function QuizSettingsModal({
  quizTitle,
  quizInstructions,
  quizSettings,
  onTitleChange,
  onInstructionsChange,
  onSettingChange,
  onSave,
  onClose,
}: QuizSettingsModalProps) {
  const [localTitle, setLocalTitle] = useState(quizTitle);
  const [localInstructions, setLocalInstructions] = useState(quizInstructions);
  const [localSettings, setLocalSettings] = useState(quizSettings);

  const handleLocalChange = (key: string, value: number | boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Pass values directly to avoid state race condition in parent
    onSave({
      title: localTitle,
      instructions: localInstructions,
      settings: localSettings,
    });
    // onClose handled by parent inside onSave wrapper or passed down
  };

  return (
    <div className="max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quiz Title */}
        <div>
          <label
            htmlFor="quizTitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quiz Title
          </label>
          <input
            id="quizTitle"
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quiz title..."
          />
        </div>

        {/* Quiz Instructions */}
        <div>
          <label
            htmlFor="quizInstructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Instructions
          </label>
          <textarea
            id="quizInstructions"
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quiz instructions..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passing Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="passingScore"
                className="text-sm font-medium text-gray-700"
              >
                Passing Score
              </label>
              <span className="text-sm font-semibold text-blue-600">
                {localSettings.passingScore}%
              </span>
            </div>
            <input
              id="passingScore"
              type="range"
              min={0}
              max={100}
              step={5}
              value={localSettings.passingScore}
              onChange={(e) =>
                handleLocalChange("passingScore", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500">
              Minimum score required to pass the quiz
            </p>
          </div>

          {/* Max Attempts */}
          <div className="space-y-2">
            <label
              htmlFor="attempts"
              className="text-sm font-medium text-gray-700"
            >
              Maximum Attempts
            </label>
            <input
              id="attempts"
              type="number"
              min={1}
              max={10}
              value={localSettings.attempts}
              onChange={(e) =>
                handleLocalChange("attempts", parseInt(e.target.value) || 1)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Number of times a student can attempt this quiz
            </p>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="shuffleQuestions"
                className="text-sm font-medium text-gray-700"
              >
                Shuffle Questions
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Randomize question order for each attempt
              </p>
            </div>
            <input
              id="shuffleQuestions"
              type="checkbox"
              checked={localSettings.shuffleQuestions}
              onChange={(e) =>
                handleLocalChange("shuffleQuestions", e.target.checked)
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="showFeedback"
                className="text-sm font-medium text-gray-700"
              >
                Show Feedback
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Display correct answers after submission
              </p>
            </div>
            <input
              id="showFeedback"
              type="checkbox"
              checked={localSettings.showFeedback}
              onChange={(e) =>
                handleLocalChange("showFeedback", e.target.checked)
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Footer - Sticky */}
      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
