'use client'

import { useCallback } from 'react'
import { useModal } from '@/lib/modal-context'
import ConfirmDialog, { ConfirmVariant } from '@/components/common/ConfirmDialog'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

export const useConfirm = () => {
  const { openModal, closeModal } = useModal()

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const handleConfirm = () => {
          closeModal(modalId)
          resolve(true)
        }

        const handleCancel = () => {
          closeModal(modalId)
          resolve(false)
        }

        const modalId = openModal(
          <ConfirmDialog
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            variant={options.variant}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />,
          {
            size: 'sm',
            closable: true,
            persistent: false,
            onClose: () => resolve(false), // Treat close button/escape as cancel
          }
        )
      })
    },
    [openModal, closeModal]
  )

  return confirm
}
