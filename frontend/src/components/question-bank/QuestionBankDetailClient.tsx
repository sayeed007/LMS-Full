// components/question-bank/QuestionBankDetailClient.tsx
"use client"

import { showErrorToast } from "@/lib/toast-utils"
import { useGetQuestionBankQuery } from "@/store/api/questionBankApi"
import { ArrowLeft, BookOpen, Plus, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PageLayout } from "../ui"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import PrimaryActionButton from "../ui/PrimaryButton"
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton"
import { QuestionBankDialog } from "./QuestionBankDialog"
import { SectionDialog } from "./SectionDialog"

interface QuestionBankDetailClientProps {
    questionBankId: string
}

export function QuestionBankDetailClient({ questionBankId }: QuestionBankDetailClientProps) {
    const router = useRouter()
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showSectionDialog, setShowSectionDialog] = useState(false)

    const {
        data: questionBankData,
        isLoading,
        error
    } = useGetQuestionBankQuery(questionBankId)

    // Handle error state
    if (error) {
        showErrorToast(
            'Failed to load question bank',
            'Please check your connection and try again.',
        )
    }

    const questionBank = questionBankData?.data?.questionBank
    const sections = questionBank?.sections || []

    // Loading state
    if (isLoading) {
        return (
            <PageLayout title="Loading...">
                <div className="flex items-center justify-center py-20">
                    <div className="animate-pulse space-y-4 w-full max-w-4xl">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </PageLayout>
        )
    }

    // Error or not found state
    if (!questionBank) {
        return (
            <PageLayout title="Question Bank Not Found">
                <div className="flex flex-col items-center justify-center py-20">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Question Bank Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {`The question bank you're looking for doesn't exist or you don't have access to it.`}
                    </p>
                    <PrimaryActionButton onClick={() => router.push('/question-bank')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Question Banks
                    </PrimaryActionButton>
                </div>
            </PageLayout>
        )
    }

    const navigateToQuestions = (sectionId: string) => {
        // Course-independent route: question banks no longer require courses
        router.push(`/question-bank/${questionBankId}/sections/${sectionId}/questions`)
    }

    return (
        <PageLayout
            title={questionBank.name}
            headerActions={
                <div className="flex gap-2">
                    <PrimaryOutlineButton
                        variant="primary"
                        onClick={() => router.push('/question-bank')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </PrimaryOutlineButton>
                    <PrimaryOutlineButton
                        variant="info"
                        onClick={() => setShowEditDialog(true)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                    </PrimaryOutlineButton>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Question Bank Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {questionBank.name}
                                </h1>
                                <Badge
                                    variant={questionBank.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                        questionBank.status === 'active'
                                            ? 'bg-success text-white'
                                            : questionBank.status === 'draft'
                                                ? 'bg-warning-bg text-warning'
                                                : 'bg-gray-200 text-gray-600'
                                    }
                                >
                                    {questionBank.status === 'active' ? 'Published' :
                                        questionBank.status === 'draft' ? 'Draft' : 'Archived'}
                                </Badge>
                            </div>

                            {questionBank.description && (
                                <p className="text-gray-600 mb-4">
                                    {questionBank.description}
                                </p>
                            )}

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{sections.length} Sections</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>{questionBank.totalQuestions || 0} Questions</span>
                                </div>
                                {questionBank.course && (
                                    <div>
                                        Course: <span className="font-medium">{questionBank.course.title}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Sections</h2>
                        <PrimaryActionButton
                            className="bg-info hover:bg-info/90"
                            onClick={() => setShowSectionDialog(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                        </PrimaryActionButton>
                    </div>

                    {sections.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="text-gray-500 mb-4">
                                    No sections yet. Create your first section to organize questions.
                                </div>
                                <PrimaryActionButton
                                    className="bg-info hover:bg-info/90"
                                    onClick={() => setShowSectionDialog(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Section
                                </PrimaryActionButton>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {sections.map((section) => (
                                <Card key={section._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {section.name}
                                                    </h3>
                                                    {section.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {section.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge
                                                            variant={section.isActive ? "default" : "secondary"}
                                                            className={section.isActive ? "bg-green-100 text-green-800" : ""}
                                                        >
                                                            {section.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigateToQuestions(section._id)}
                                                >
                                                    Manage Questions
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Question Bank Dialog */}
            <QuestionBankDialog
                isOpen={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                onSuccess={() => {
                    setShowEditDialog(false)
                    // Data will auto-refresh via RTK Query cache invalidation
                }}
                questionBank={questionBank}
                mode="edit"
            />

            {/* Add/Edit Section Dialog */}
            <SectionDialog
                isOpen={showSectionDialog}
                onClose={() => setShowSectionDialog(false)}
                onSuccess={() => {
                    setShowSectionDialog(false)
                    // Data will auto-refresh via RTK Query cache invalidation
                }}
                questionBankId={questionBankId}
                mode="create"
            />
        </PageLayout>
    )
}
