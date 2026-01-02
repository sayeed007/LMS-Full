// components/question-bank/QuestionBankActionMenu.tsx
"use client"

import Image from "next/image"
import { QuestionBank } from "@/store/api/questionBankApi"

interface ActionItem {
  key: string
  label: string
  icon: string
  className?: string
  show: boolean
}

interface QuestionBankActionMenuProps {
  isOpen: boolean
  questionBank: QuestionBank
  onEdit?: () => void
  onActivate?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onClose: () => void
}

export function QuestionBankActionMenu({
  isOpen,
  questionBank,
  onEdit,
  onActivate,
  onArchive,
  onDelete,
  onClose
}: QuestionBankActionMenuProps) {
  if (!isOpen) return null

  const actions: ActionItem[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: '/icons/Edit.png',
      show: !!onEdit
    },
    {
      key: 'activate',
      label: 'Activate',
      icon: '/icons/CheckCircle.png',
      show: questionBank.status === 'draft' && !!onActivate
    },
    {
      key: 'archive',
      label: 'Archive',
      icon: '/icons/Archive.png',
      show: questionBank.status === 'active' && !!onArchive
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: '/icons/Delete.png',
      className: 'text-red-600 hover:bg-red-50',
      show: !!onDelete
    }
  ].filter(action => action.show)

  const handleAction = (key: string) => {
    switch (key) {
      case 'edit':
        onEdit?.()
        break
      case 'activate':
        onActivate?.()
        break
      case 'archive':
        onArchive?.()
        break
      case 'delete':
        onDelete?.()
        break
    }
    onClose()
  }

  return (
    <>
      {/* Overlay - Click outside to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Action Menu Popup */}
      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
        <div className="space-y-1">
          {actions.map((action, index) => (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation()
                handleAction(action.key)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors rounded ${index === actions.length - 1 && action.key === 'delete' ? 'border-t border-gray-200 mt-1 pt-2' : ''
                } ${action.className || ''}`}
            >
              <Image
                width={16}
                height={16}
                src={action.icon}
                alt={action.label}
                className="w-4 h-4"
              />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
