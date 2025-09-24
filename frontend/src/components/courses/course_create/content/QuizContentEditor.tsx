"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentQuizQuestion } from '@/types/backend-models';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface QuizContentEditorProps {
    data: {
        quiz?: {
            instructions?: string;
            timeLimit?: number;
            attempts: number;
            shuffleQuestions: boolean;
            showFeedback: boolean;
            passingScore: number;
            questions: ContentQuizQuestion[];
        };
    };
    onChange: (data: any) => void;
}

export default function QuizContentEditor({ data, onChange }: QuizContentEditorProps) {
    const quiz = data?.quiz || {
        instructions: '',
        timeLimit: 0,
        attempts: 1,
        shuffleQuestions: false,
        showFeedback: true,
        passingScore: 70,
        questions: []
    };

    const [instructions, setInstructions] = useState(quiz.instructions || '');
    const [timeLimit, setTimeLimit] = useState(quiz.timeLimit || 0);
    const [attempts, setAttempts] = useState(quiz.attempts || 1);
    const [passingScore, setPassingScore] = useState(quiz.passingScore || 70);
    const [questions, setQuestions] = useState<ContentQuizQuestion[]>(quiz.questions || []);

    const updateQuiz = (updates: any) => {
        const newQuiz = { ...quiz, ...updates };
        onChange({ quiz: newQuiz });
    };

    const addQuestion = () => {
        const newQuestion: ContentQuizQuestion = {
            _id: `temp_${Date.now()}`,
            type: 'single_choice',
            order: questions.length + 1,
            question: '',
            options: [
                { text: '', isCorrect: true, explanation: '' },
                { text: '', isCorrect: false, explanation: '' }
            ],
            points: 1,
            explanation: '',
            hint: '',
            isRequired: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newQuestions = [...questions, newQuestion];
        setQuestions(newQuestions);
        updateQuiz({ questions: newQuestions });
    };

    const updateQuestion = (index: number, updates: Partial<ContentQuizQuestion>) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        setQuestions(newQuestions);
        updateQuiz({ questions: newQuestions });
    };

    const deleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        updateQuiz({ questions: newQuestions });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Quiz Content</h3>
            </div>

            {/* Quiz Settings */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Quiz Settings</h4>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                    </label>
                    <Textarea
                        value={instructions}
                        onChange={(e) => {
                            setInstructions(e.target.value);
                            updateQuiz({ instructions: e.target.value });
                        }}
                        placeholder="Enter quiz instructions"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Limit (minutes)
                        </label>
                        <Input
                            type="number"
                            value={timeLimit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setTimeLimit(value);
                                updateQuiz({ timeLimit: value });
                            }}
                            placeholder="0 for no limit"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Attempts
                        </label>
                        <Input
                            type="number"
                            value={attempts}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                setAttempts(value);
                                updateQuiz({ attempts: value });
                            }}
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passing Score (%)
                        </label>
                        <Input
                            type="number"
                            value={passingScore}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 70;
                                setPassingScore(value);
                                updateQuiz({ passingScore: value });
                            }}
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Questions</h4>
                    <Button onClick={addQuestion} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Question
                    </Button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No questions added yet</p>
                        <Button onClick={addQuestion}>Add Your First Question</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div key={question._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                        <span className="font-medium">Question {index + 1}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteQuestion(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Question
                                        </label>
                                        <Textarea
                                            value={question.question}
                                            onChange={(e) => updateQuestion(index, { question: e.target.value })}
                                            placeholder="Enter your question"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Options for multiple choice */}
                                    {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Answer Options
                                            </label>
                                            <div className="space-y-2">
                                                {question.options?.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center gap-3">
                                                        <input
                                                            type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                                                            name={`question_${index}`}
                                                            checked={option.isCorrect}
                                                            onChange={(e) => {
                                                                const newOptions = [...(question.options || [])];
                                                                if (question.type === 'single_choice') {
                                                                    // For single choice, only one can be correct
                                                                    newOptions.forEach((opt, i) => {
                                                                        opt.isCorrect = i === optionIndex;
                                                                    });
                                                                } else {
                                                                    // For multiple choice, toggle this option
                                                                    newOptions[optionIndex].isCorrect = e.target.checked;
                                                                }
                                                                updateQuestion(index, { options: newOptions });
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <Input
                                                            value={option.text}
                                                            onChange={(e) => {
                                                                const newOptions = [...(question.options || [])];
                                                                newOptions[optionIndex].text = e.target.value;
                                                                updateQuestion(index, { options: newOptions });
                                                            }}
                                                            placeholder={`Option ${optionIndex + 1}`}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Points
                                            </label>
                                            <Input
                                                type="number"
                                                value={question.points}
                                                onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Time Limit (seconds)
                                            </label>
                                            <Input
                                                type="number"
                                                value={question.timeLimit || 0}
                                                onChange={(e) => updateQuestion(index, { timeLimit: parseInt(e.target.value) || 0 })}
                                                placeholder="0 for no limit"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Explanation (Optional)
                                        </label>
                                        <Textarea
                                            value={question.explanation || ''}
                                            onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                                            placeholder="Explain the correct answer"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-sm text-gray-500">
                <p>Quiz features:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Students must achieve the passing score to complete the quiz</li>
                    <li>Questions can be reordered by dragging</li>
                    <li>Set time limits for individual questions or the entire quiz</li>
                </ul>
            </div>
        </div>
    );
}