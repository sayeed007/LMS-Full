// QuestionsPageClient.tsx - Client Component
'use client'

import { QuestionEditor } from '@/components/question-bank/QuestionEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SettingsPopup } from '@/components/question-bank/QuestionBankSettingsPopup'
import { QuestionTypesDialog } from '@/components/question-bank/QuestionTypePopUp'
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import PrimaryActionButton from '@/components/ui/PrimaryButton'
import PrimaryOutlineButton from '@/components/ui/PrimaryOutlineButton'
import { quizData } from '@/dummyData/quizData'
import Image from 'next/image'
import { Question } from '@/types'

interface QuestionsPageClientProps {
    courseId: string
    sectionId: string
}

const quezQuestions: Question[] = [...quizData?.[0]?.questions];

export function QuestionsPageClient({ courseId, sectionId }: QuestionsPageClientProps) {
    const router = useRouter()
    const [sectionTitle, setSectionTitle] = useState('Introduction to UI/UX')
    const [questions, setQuestions] = useState<Question[]>([...quezQuestions])
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const [showAddQuestionPopup, setShowAddQuestionPopup] = useState(false);

    const createQuestion = (type: string): Question => {
        const questionTypes = {
            'single-choice': 'single-choice' as const,
            'multiple-choice': 'multiple-choice' as const,
            'descriptive': 'descriptive' as const,
            'question-bank': 'question-bank' as const
        }

        const baseQuestion: Question = {
            id: `question-${Date.now()}`,
            type: questionTypes[type as keyof typeof questionTypes] || 'single-choice',
            text: '',
            choices: [],
            score: 2,
            timeLimit: 0,
            required: false
        }

        // Add default choices for choice-based questions
        if (type === 'single-choice' || type === 'multiple-choice') {
            baseQuestion.choices = [
                { id: `choice-${Date.now()}-1`, text: '', isCorrect: false },
                { id: `choice-${Date.now()}-2`, text: '', isCorrect: false }
            ]
        }

        return baseQuestion
    }

    const handleAddQuestion = (type: string) => {
        const newQuestion = createQuestion(type)
        setQuestions([...questions, newQuestion])
        setShowAddQuestionPopup(false)
    }

    const handleUpdateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
        ))
    }

    const handleDeleteQuestion = (questionId: string) => {
        setQuestions(questions.filter(q => q.id !== questionId))
    }

    const handlePreview = () => {
        // Store current state in session storage or context
        const previewData = {
            courseId,
            sectionId,
            sectionTitle,
            questions
        }

        // Store in session storage for preview
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('previewData', JSON.stringify(previewData))
        }

        router.push(`/question-bank/courses/${courseId}/sections/${sectionId}/preview`)
    }

    const handleSave = () => {
        // Implement save logic here
        console.log('Saving:', { courseId, sectionId, sectionTitle, questions })
        // You would typically send this to your API

        // Show success message or handle response
        // router.push(`/question-bank/courses/${courseId}`)
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveSettings = (settings: any) => {
        console.log('Settings saved:', settings)
        // Handle the settings data here
        // You can send it to your API, update state, etc.
        setShowSettingsPopup(false)
    };

    const handleClearTitle = () => {
        setSectionTitle('')
    }

    const handleSettingsClick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        setShowSettingsPopup(prev => !prev)
    }

    const handleAddQuestionClick = () => {
        setShowAddQuestionPopup(true)
    }

    const handleCloseAddQuestion = () => {
        setShowAddQuestionPopup(false)
    }

    const handleCloseSettings = () => {
        setShowSettingsPopup(false)
    }

    return (
        <div className="px-2 py-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-12">
                {/* LEFT - NAME */}
                <div className="flex items-center gap-4 flex-2">
                    <GoBackRoute />
                    <div className="relative flex items-center gap-2 flex-2">
                        <Input
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            className="flex-1 text-lg pr-10 font-medium bg-transparent outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:border focus:border-gray-300"
                            placeholder="Enter section title..."
                        />
                        <Image
                            src="/icons/Cross.png"
                            alt="Cross"
                            width={16}
                            height={16}
                            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                            onClick={handleClearTitle}
                        />
                    </div>
                </div>

                {/* RIGHT - Buttons */}
                <div className="flex items-center justify-end gap-2 flex-1">
                    <div className="relative">
                        <PrimaryOutlineButton onClick={(e) => handleSettingsClick(e)}>
                            <Image
                                src={'/icons/Settings.png'}
                                alt={'Settings'}
                                width={20}
                                height={20}
                            />
                        </PrimaryOutlineButton>

                        {/* Settings popup */}
                        <SettingsPopup
                            isOpen={showSettingsPopup}
                            onClose={handleCloseSettings}
                            onSave={handleSaveSettings}
                        />
                    </div>

                    <PrimaryOutlineButton onClick={handlePreview}>
                        Preview
                    </PrimaryOutlineButton>

                    <PrimaryActionButton onClick={handleSave}>
                        Save
                    </PrimaryActionButton>
                </div>
            </div>

            {/* Section Content */}
            <div>
                {/* Questions List */}
                <div className="space-y-6 mb-6">
                    {questions.map((question) => (
                        <QuestionEditor
                            key={question.id}
                            question={question}
                            onUpdate={handleUpdateQuestion}
                            onDelete={handleDeleteQuestion}
                        />
                    ))}
                </div>

                <div className='relative mb-12'>
                    <hr className="border-dashed border-grey-1" />

                    <div className='w-full flex justify-center absolute top-[-20px]'>
                        <Button
                            className="border-1 border-grey-1 rounded-4xl font-bold bg-white"
                            onClick={handleAddQuestionClick}
                        >
                            + Add Question
                        </Button>
                    </div>

                    {/* Add Question Dialog */}
                    <QuestionTypesDialog
                        isOpen={showAddQuestionPopup}
                        onClose={handleCloseAddQuestion}
                        onSelectType={handleAddQuestion}
                    />
                </div>
            </div>
        </div>
    )
}
