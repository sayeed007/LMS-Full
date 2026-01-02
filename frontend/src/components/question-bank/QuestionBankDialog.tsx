// components/question-bank/QuestionBankDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils"
import { useCreateQuestionBankMutation, useUpdateQuestionBankMutation } from "@/store/api/questionBankApi"
import { QuestionBank } from "@/store/api/questionBankApi"

interface QuestionBankDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (questionBankId: string) => void
    questionBank?: QuestionBank // For editing existing bank
    mode?: 'create' | 'edit'
}

export function QuestionBankDialog({
    isOpen,
    onClose,
    onSuccess,
    questionBank,
    mode = 'create'
}: QuestionBankDialogProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [createQuestionBank] = useCreateQuestionBankMutation()
    const [updateQuestionBank] = useUpdateQuestionBankMutation()

    // Populate form when editing
    useEffect(() => {
        if (mode === 'edit' && questionBank) {
            setName(questionBank.name)
            setDescription(questionBank.description || '')
        } else {
            setName('')
            setDescription('')
        }
    }, [mode, questionBank, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            showErrorToast('Name is required', 'Please enter a name for your question bank')
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'create') {
                // Create new question bank
                const result = await createQuestionBank({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    // course is optional - omitting creates a personal/shared question bank
                }).unwrap()

                showSuccessToast(
                    'Question Bank Created',
                    `"${name}" has been created successfully`
                )

                // Call success callback with the new bank ID
                if (onSuccess) {
                    onSuccess(result.data.questionBank._id)
                }
            } else {
                // Update existing question bank
                if (!questionBank?._id) return

                await updateQuestionBank({
                    id: questionBank._id,
                    data: {
                        name: name.trim(),
                        description: description.trim() || undefined,
                    }
                }).unwrap()

                showSuccessToast(
                    'Question Bank Updated',
                    `"${name}" has been updated successfully`
                )

                if (onSuccess) {
                    onSuccess(questionBank._id)
                }
            }

            // Reset form and close
            setName('')
            setDescription('')
            onClose()
        } catch (error: any) {
            console.error('Error saving question bank:', error)
            showErrorToast(
                mode === 'create' ? 'Failed to Create Question Bank' : 'Failed to Update Question Bank',
                error?.data?.message || 'Please try again'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setName('')
            setDescription('')
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create Question Bank' : 'Edit Question Bank'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Create a new question bank to organize your questions by topic or course.'
                            : 'Update your question bank details.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Mathematics Questions, General Knowledge"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description <span className="text-gray-400 text-sm">(Optional)</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what this question bank is for..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> After creating your question bank, you can add sections (topics)
                            and questions to organize your content.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="bg-info hover:bg-info/90 text-white"
                        >
                            {isSubmitting
                                ? (mode === 'create' ? 'Creating...' : 'Updating...')
                                : (mode === 'create' ? 'Create Question Bank' : 'Update Question Bank')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
