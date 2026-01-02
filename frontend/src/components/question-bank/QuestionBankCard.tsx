// components/question-bank/QuestionBankCard.tsx
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Dialog, DialogContent } from "../ui/dialog"
import Image from "next/image"
import { QuestionBank, useArchiveQuestionBankMutation, useDeleteQuestionBankMutation, useActivateQuestionBankMutation } from "@/store/api/questionBankApi"
import { QuestionBankActionMenu } from "./QuestionBankActionMenu"
import ConfirmDialog from "../common/ConfirmDialog"
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils"
import { useState } from "react"

interface QuestionBankCardProps {
    questionBank: QuestionBank
    onClick?: () => void
    onEdit?: () => void
}

export function QuestionBankCard({
    questionBank,
    onClick,
    onEdit
}: QuestionBankCardProps) {
    const { name, description, createdBy, status, totalQuestions, sections } = questionBank;
    const creatorName = createdBy?.name || 'Unknown';
    const creatorAvatar = createdBy?.avatar;
    const creatorInitials = creatorName.split(' ').map(n => n[0]).join('').toUpperCase();

    const topicCount = sections?.length || 0;
    const questionCount = totalQuestions || 0;

    const [archiveQuestionBank] = useArchiveQuestionBankMutation()
    const [deleteQuestionBank] = useDeleteQuestionBankMutation()
    const [activateQuestionBank] = useActivateQuestionBankMutation()
    const [isProcessing, setIsProcessing] = useState(false)
    const [showActionMenu, setShowActionMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

    const handleArchive = () => {
        if (isProcessing) return
        setShowArchiveConfirm(true)
    }

    const confirmArchive = async () => {
        setShowArchiveConfirm(false)
        if (isProcessing) return

        setIsProcessing(true)
        try {
            await archiveQuestionBank(questionBank._id).unwrap()
            showSuccessToast('Question Bank Archived', `"${name}" has been archived`)
        } catch (error) {
            console.error('Error archiving question bank:', error)
            showErrorToast('Failed to archive', 'Please try again')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleActivate = async () => {
        if (isProcessing) return

        setIsProcessing(true)
        try {
            await activateQuestionBank(questionBank._id).unwrap()
            showSuccessToast('Question Bank Activated', `"${name}" is now active`)
        } catch (error) {
            console.error('Error activating question bank:', error)
            showErrorToast('Failed to activate', 'Please try again')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDelete = () => {
        if (isProcessing) return
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        setShowDeleteConfirm(false)
        if (isProcessing) return

        setIsProcessing(true)
        try {
            await deleteQuestionBank(questionBank._id).unwrap()
            showSuccessToast('Question Bank Deleted', `"${name}" has been permanently deleted`)
        } catch (error) {
            console.error('Error deleting question bank:', error)
            showErrorToast('Failed to delete', 'Please try again')
        } finally {
            setIsProcessing(false)
        }
    }


    return (
        <div
            className="bg-white rounded-2xl border-off-white-2 shadow-1 border p-4 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            {/* Header with title and action button */}
            <div className="relative mb-3">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start flex-1">
                        {/* Status Badge */}
                        <div className={cn(
                            "px-2 p-1 rounded-3xl text-xs whitespace-nowrap",
                            status === 'active' ? 'bg-success text-white' :
                                status === 'draft' ? 'bg-warning-bg text-warning' :
                                    'bg-gray-200 text-gray-600'
                        )}>
                            {status === 'active' ? 'Active' :
                                status === 'draft' ? 'Draft' :
                                    'Archived'}
                        </div>

                        <h3 className="font-semibold text-gray-900 line-clamp-2 pr-2 mt-2">
                            {name}
                        </h3>
                    </div>

                    {/* Actions Menu Button */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowActionMenu(!showActionMenu)
                            }}
                            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                        >
                            <Image
                                src="/icons/ActionThreeDots.png"
                                alt="Actions"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                            />
                        </button>

                        {/* Custom Action Menu */}
                        <QuestionBankActionMenu
                            isOpen={showActionMenu}
                            questionBank={questionBank}
                            onEdit={onEdit}
                            onActivate={handleActivate}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            onClose={() => setShowActionMenu(false)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Avatar className="w-5 h-5">
                        <AvatarImage src={creatorAvatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {creatorInitials}
                        </AvatarFallback>
                    </Avatar>
                    <span>{creatorName}</span>
                </div>
            </div>

            {/* Content area with description or tags */}
            <div className="flex-1 mb-4">
                <div className="text-sm text-gray-600 line-clamp-2">
                    {description}
                </div>
            </div>

            {/* Footer - Stats section */}
            <div className="flex items-center justify-between gap-4 text-sm text-gray-600 pt-2 border-t-1 border-off-white-5">
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/Topic.png"
                        alt="Topic"
                        width={16}
                        height={16}
                    />
                    <span>{topicCount} Topics</span>
                </div>

                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/HelpCircle.png"
                        alt="HelpCircle"
                        width={16}
                        height={16}
                    />
                    <span>{questionCount} Questions</span>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent showCloseButton={false}>
                    <ConfirmDialog
                        title="Delete Question Bank"
                        message={`Delete "${name}"? This action cannot be undone and will delete all questions in this bank.`}
                        variant="danger"
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={confirmDelete}
                        onCancel={() => setShowDeleteConfirm(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Dialog */}
            <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
                <DialogContent showCloseButton={false}>
                    <ConfirmDialog
                        title="Archive Question Bank"
                        message={`Archive "${name}"? It will no longer appear in active lists.`}
                        variant="warning"
                        confirmText="Archive"
                        cancelText="Cancel"
                        onConfirm={confirmArchive}
                        onCancel={() => setShowArchiveConfirm(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}