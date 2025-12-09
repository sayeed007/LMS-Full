// modal-context.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, FC, useEffect } from 'react'
import { X } from 'lucide-react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'auto'
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export interface ModalOptions {
    /**
     * Size of the modal (default: 'md')
     */
    size?: ModalSize;
    /**
     * Position of the modal (default: 'center')
     */
    position?: ModalPosition;
    /**
     * Whether the modal can be closed via Escape key or backdrop click (default: true)
     */
    closable?: boolean;
    /**
     * Whether to show a backdrop (default: true)
     */
    backdrop?: boolean;
    /**
     * Custom CSS classes for the modal container
     */
    className?: string;
    /**
     * Custom CSS classes for the overlay
     */
    overlayClassName?: string;
    /**
     * Prevents closing via backdrop click or Escape key (default: false)
     * Note: Does not affect the close button if showCloseButton is true
     */
    persistent?: boolean;
    /**
     * Whether to show the close button (default: true)
     */
    showCloseButton?: boolean;
    /**
     * Callback when the modal is opened
     */
    onOpen?: () => void;
    /**
     * Callback when the modal is closed
     */
    onClose?: () => void;
}

export interface ModalState {
    isOpen: boolean
    component: ReactNode | null
    options: ModalOptions
    id: string
}

export interface ModalContextType {
    openModal: (component: ReactNode, options?: ModalOptions) => string
    closeModal: (id?: string) => void
    closeAllModals: () => void
    modals: ModalState[]
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const DEFAULT_MODAL_OPTIONS: Required<ModalOptions> = {
    size: 'md',
    position: 'center',
    closable: true,
    backdrop: true,
    persistent: false,
    showCloseButton: true,
    className: '',
    overlayClassName: '',
    onClose: () => { },
    onOpen: () => { },
};

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modals, setModals] = useState<ModalState[]>([])

    const generateId = () => `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const openModal = useCallback((component: ReactNode, options: ModalOptions = {}) => {
        const id = generateId()
        const newModal: ModalState = {
            id,
            isOpen: true,
            component,
            options: {
                size: 'md',
                position: 'center',
                closable: true,
                backdrop: true,
                persistent: false,
                showCloseButton: true,
                ...options,
            },
        }

        setModals(prev => [...prev, newModal])

        // Call onOpen callback
        if (options.onOpen) {
            options.onOpen();
        }

        return id
    }, [])

    const closeModal = useCallback((id?: string) => {
        setModals(prev => {
            if (id) {
                const modal = prev.find(m => m.id === id)
                if (modal?.options.onClose) {
                    modal.options.onClose()
                }
                return prev.filter(modal => modal.id !== id)
            } else {
                // Close the topmost modal
                const topModal = prev[prev.length - 1]
                if (topModal?.options.onClose) {
                    topModal.options.onClose()
                }
                return prev.slice(0, -1)
            }
        })
    }, [])

    const closeAllModals = useCallback(() => {
        modals.forEach(modal => {
            if (modal.options.onClose) {
                modal.options.onClose()
            }
        })
        setModals([])
    }, [modals])

    return (
        <ModalContext.Provider value={{ openModal, closeModal, closeAllModals, modals }}>
            {children}
            <ModalContainer />
        </ModalContext.Provider>
    )
}

const ModalContainer: FC = () => {
    const { modals, closeModal } = useModal()

    if (modals.length === 0) return null

    return (
        <>
            {modals.map((modal, index) => (
                <ModalWrapper key={modal.id} modal={modal} zIndex={1000 + index} onClose={() => closeModal(modal.id)} />
            ))}
        </>
    )
}

export interface ModalWrapperProps {
    modal: ModalState
    zIndex: number
    onClose: (event?: React.MouseEvent | KeyboardEvent) => void
}

const ModalWrapper: FC<ModalWrapperProps> = ({ modal, zIndex, onClose }) => {
    const { options, component } = modal
    const safeOptions: Required<ModalOptions> = {
        size: options.size ?? 'md',
        position: options.position ?? 'center',
        closable: options.closable ?? true,
        backdrop: options.backdrop ?? true,
        persistent: options.persistent ?? false,
        showCloseButton: options.showCloseButton ?? true,
        className: options.className ?? '',
        overlayClassName: options.overlayClassName ?? '',
        onClose: options.onClose ?? (() => { }),
        onOpen: options.onOpen ?? (() => { }),
    };

    const getSizeClasses = (size: ModalSize): string => {
        switch (size) {
            case 'sm': return 'max-w-sm w-full'
            case 'md': return 'max-w-md w-full'
            case 'lg': return 'max-w-lg w-full'
            case 'xl': return 'max-w-xl w-full'
            case '2xl': return 'max-w-2xl w-full'
            case 'full': return 'w-full h-full max-w-none max-h-none'
            case 'auto': return 'w-auto'
            default: return 'max-w-md w-full'
        }
    }

    // Fixed positioning logic
    const getOverlayClasses = (position: ModalPosition, size: ModalSize): string => {
        if (size === 'full') {
            return 'flex'
        }

        switch (position) {
            case 'center': return 'flex items-center justify-center'
            case 'top': return 'flex items-start justify-center pt-8'
            case 'bottom': return 'flex items-end justify-center pb-8'
            case 'left': return 'flex items-center justify-start'
            case 'right': return 'flex items-center justify-end'
            default: return 'flex items-center justify-center'
        }
    }

    // Get animation classes based on position
    const getAnimationClasses = (position: ModalPosition): string => {
        switch (position) {
            case 'right': return 'animate-slide-in-right'
            case 'left': return 'animate-slide-in-left'
            case 'top': return 'animate-slide-in-top'
            case 'bottom': return 'animate-slide-in-bottom'
            default: return 'animate-fade-scale-in'
        }
    }

    // Get height/width constraints for side panels
    const getSidePanelClasses = (position: ModalPosition): string => {
        if (position === 'left' || position === 'right') {
            return 'h-full max-h-full rounded-none'
        }
        if (position === 'top' || position === 'bottom') {
            return 'w-full rounded-none'
        }
        return ''
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && safeOptions.backdrop && !safeOptions.persistent) {
            onClose()
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && safeOptions.closable && !safeOptions.persistent) {
            onClose()
        }
    }

    useEffect(() => {
        if (safeOptions.closable) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeOptions.closable])

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            // Only restore scroll if this is the last modal
            if (document.querySelectorAll('[data-modal-wrapper]').length <= 1) {
                document.body.style.overflow = 'unset'
            }
        }
    }, [])

    return (
        <div
            data-modal-wrapper
            role="dialog"
            aria-modal="true"
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 p-4 ${getOverlayClasses(safeOptions.position, safeOptions.size)} ${safeOptions.overlayClassName || ''}`}
            style={{ zIndex }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative h-fit bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-out
                            ${getSizeClasses(safeOptions.size)}
                            ${safeOptions.size === 'full' ? 'rounded-none' : ''}
                            ${getSidePanelClasses(safeOptions.position)}
                            ${getAnimationClasses(safeOptions.position)}
                            ${safeOptions.className || ''}
                            `}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
                ref={(el) => el?.focus()}
            >
                {/* Close button */}
                {safeOptions.showCloseButton && safeOptions.closable && (
                    <button
                        onClick={(e) => onClose(e)}
                        className={`absolute top-4 right-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ${safeOptions.size === 'full' ? 'top-6 right-6' : ''}`}
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                )}

                {/* Modal content */}
                <div className="relative w-full h-full">
                    {component}
                </div>
            </div>
        </div>
    )
}