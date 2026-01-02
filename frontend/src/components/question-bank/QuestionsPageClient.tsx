// QuestionsPageClient.tsx - Client Component
'use client'

import { QuestionEditor } from '@/components/question-bank/QuestionEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SettingsPopup, type SettingsData } from '@/components/question-bank/QuestionBankSettingsPopup'
import { QuestionTypesDialog } from '@/components/question-bank/QuestionTypePopUp'
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import PrimaryActionButton from '@/components/ui/PrimaryButton'
import PrimaryOutlineButton from '@/components/ui/PrimaryOutlineButton'
import Image from 'next/image'
import {
    useGetQuestionBankQuery,
    useUpdateQuestionBankMutation,
    useAddSectionMutation
} from '@/store/api/questionBankApi'
import {
    useGetQuestionsByQuestionBankQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
    type CreateQuestionRequest
} from '@/store/api/questionApi'
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils'
import { QuestionPopulated } from '@/store/api/questionApi'
import { Question } from '@/types'
import { useConfirm } from '@/hooks/useConfirm'

interface QuestionsPageClientProps {
    questionBankId: string
    sectionId?: string
}

export function QuestionsPageClient({ questionBankId, sectionId }: QuestionsPageClientProps) {
    const router = useRouter()
    const confirm = useConfirm()
    const [questionBankName, setQuestionBankName] = useState('')
    const [showSettingsPopup, setShowSettingsPopup] = useState(false)
    const [showAddQuestionPopup, setShowAddQuestionPopup] = useState(false)

    // Fetch question bank data
    const { data: questionBankData, isLoading: isLoadingBank } = useGetQuestionBankQuery(questionBankId)

    // Fetch questions for this question bank
    const {
        data: questionsData,
        isLoading: isLoadingQuestions,
        refetch: refetchQuestions
    } = useGetQuestionsByQuestionBankQuery({ questionBankId, sectionId })

    // Mutations
    const [updateQuestionBank] = useUpdateQuestionBankMutation()
    const [createQuestion] = useCreateQuestionMutation()
    const [updateQuestion] = useUpdateQuestionMutation()
    const [deleteQuestion] = useDeleteQuestionMutation()

    const questionBank = questionBankData?.data?.questionBank
    const questions = questionsData?.data?.questions || []

    useEffect(() => {
        if (questionBank) {
            setQuestionBankName(questionBank.name)
        }
    }, [questionBank])

    const createQuestionTemplate = (type: string): Partial<QuestionPopulated> => {
        const baseQuestion: Partial<QuestionPopulated> = {
            type: type as 'single-choice' | 'multiple-choice' | 'descriptive' | 'true-false' | 'fill-blank',
            text: '',
            questionBank: questionBankId as unknown as { _id: string; name: string },
            bankSection: sectionId, // Optional internal section within the question bank
            difficulty: 'medium',
            points: 1,
            timeLimit: 0,
            tags: [],
            isPublic: false
        }

        // Add default choices for choice-based questions
        if (type === 'single-choice' || type === 'multiple-choice' || type === 'true-false') {
            baseQuestion.choices = [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        }

        return baseQuestion
    }

    const handleAddQuestion = async (type: string) => {
        try {
            const newQuestionData = createQuestionTemplate(type)
            await createQuestion(newQuestionData as unknown as CreateQuestionRequest).unwrap()
            showSuccessToast('Question added successfully')
            setShowAddQuestionPopup(false)
            refetchQuestions()
        } catch (error) {
            console.error('Error adding question:', error);
            showErrorToast('Failed to add question', 'Please try again')
        }
    }

    const handleUpdateQuestion = async (updatedQuestion: QuestionPopulated) => {
        try {
            await updateQuestion({
                id: updatedQuestion._id,
                data: {
                    text: updatedQuestion.text,
                    choices: updatedQuestion.choices,
                    explanation: updatedQuestion.explanation,
                    difficulty: updatedQuestion.difficulty,
                    points: updatedQuestion.points,
                    timeLimit: updatedQuestion.timeLimit,
                    tags: updatedQuestion.tags
                }
            }).unwrap()
            showSuccessToast('Question updated successfully')
        } catch (error) {
            console.error('Error updating question:', error);
            showErrorToast('Failed to update question', 'Please try again')
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        const confirmed = await confirm({
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        })

        if (!confirmed) return

        try {
            await deleteQuestion(questionId).unwrap()
            showSuccessToast('Question deleted successfully')
            refetchQuestions()
        } catch (error) {
            console.error('Error deleting question:', error);
            showErrorToast('Failed to delete question', 'Please try again')
        }
    }

    const handlePreview = () => {
        router.push(`/question-bank/${questionBankId}/preview`)
    }

    const handleSave = async () => {
        try {
            await updateQuestionBank({
                id: questionBankId,
                data: {
                    name: questionBankName
                }
            }).unwrap()
            showSuccessToast('Question bank saved successfully')
        } catch (error) {
            console.error('Error saving question bank:', error);
            showErrorToast('Failed to save', 'Please try again')
        }
    }

    const handleSaveSettings = async (settings: SettingsData) => {
        try {
            await updateQuestionBank({
                id: questionBankId,
                data: {
                    settings: settings as unknown as Record<string, unknown>
                } as unknown as Record<string, unknown>
            }).unwrap()
            showSuccessToast('Settings saved successfully')
            setShowSettingsPopup(false)
        } catch (error) {
            console.error('Error saving settings:', error);
            showErrorToast('Failed to save settings', 'Please try again')
        }
    }

    const handleClearTitle = () => {
        setQuestionBankName('')
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

    if (isLoadingBank || isLoadingQuestions) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading question bank...</p>
                </div>
            </div>
        )
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
                            value={questionBankName}
                            onChange={(e) => setQuestionBankName(e.target.value)}
                            className="flex-1 text-lg pr-10 font-medium bg-transparent outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:border focus:border-gray-300"
                            placeholder="Enter question bank title..."
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
                            key={question._id}
                            question={{
                                ...question,
                                id: question._id
                            } as unknown as Question}
                            onUpdate={handleUpdateQuestion as unknown as (question: Question) => void}
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
