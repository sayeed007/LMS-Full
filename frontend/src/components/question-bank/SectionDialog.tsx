// components/question-bank/SectionDialog.tsx
"use client"

import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { Section, useAddSectionMutation, useUpdateSectionMutation } from "@/store/api/questionBankApi"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import PrimaryActionButton from "../ui/PrimaryButton"
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton"

interface SectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    questionBankId: string
    section?: Section
    mode?: 'create' | 'edit'
}

export function SectionDialog({
    isOpen,
    onClose,
    onSuccess,
    questionBankId,
    section,
    mode = 'create'
}: SectionDialogProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [addSection] = useAddSectionMutation()
    const [updateSection] = useUpdateSectionMutation()

    // Populate form when editing
    useEffect(() => {
        if (mode === 'edit' && section) {
            setName(section.name)
            setDescription(section.description || '')
            setIsActive(section.isActive)
        } else {
            setName('')
            setDescription('')
            setIsActive(true)
        }
    }, [mode, section, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            showErrorToast('Validation Error', 'Section name is required')
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'create') {
                const result = await addSection({
                    id: questionBankId,
                    data: {
                        name: name.trim(),
                        description: description.trim() || undefined,
                        isActive,
                    }
                }).unwrap()

                showSuccessToast(
                    'Section Created',
                    `"${name}" has been added to the question bank`
                )
            } else if (section) {
                await updateSection({
                    id: questionBankId,
                    sectionId: section._id,
                    data: {
                        name: name.trim(),
                        description: description.trim() || undefined,
                        isActive,
                    }
                }).unwrap()

                showSuccessToast(
                    'Section Updated',
                    `"${name}" has been updated`
                )
            }

            onSuccess?.()
            handleClose()
        } catch (error) {
            console.error('Error saving section:', error)
            const errorMessage = error && typeof error === 'object' && 'data' in error &&
                                 error.data && typeof error.data === 'object' && 'message' in error.data
                                 ? String(error.data.message)
                                 : 'Please try again'
            showErrorToast(
                mode === 'create' ? 'Failed to Create Section' : 'Failed to Update Section',
                errorMessage
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setName('')
            setDescription('')
            setIsActive(true)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Add New Section' : 'Edit Section'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Section Name */}
                    <div>
                        <label htmlFor="section-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Section Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="section-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Basic Mathematics, Grammar Rules"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Section Description */}
                    <div>
                        <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="section-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this section covers..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                            disabled={isSubmitting}
                            maxLength={500}
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                        <input
                            id="section-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="section-active" className="text-sm font-medium text-gray-700">
                            Active (questions from this section can be used in assessments)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <PrimaryOutlineButton
                            type="button"
                            variant="primary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </PrimaryOutlineButton>
                        <PrimaryActionButton
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !name.trim()}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </span>
                            ) : (
                                mode === 'create' ? 'Create Section' : 'Update Section'
                            )}
                        </PrimaryActionButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
