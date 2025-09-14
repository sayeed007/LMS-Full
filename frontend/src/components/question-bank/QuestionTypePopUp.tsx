// components/articles/article-more-option-popup.tsx
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import React, { useEffect, useRef } from "react"

interface QuestionType {
    id: string
    label: string
    iconSource: string
    description: string
}

const questionTypes: QuestionType[] = [
    {
        id: 'single-choice',
        label: 'Single Choice',
        iconSource: '/icons/SingleChoice.png',
        description: 'Select one answer from multiple options'
    },
    {
        id: 'multiple-choice',
        label: 'Multiple Choice',
        iconSource: '/icons/MultipleChoice.png',
        description: 'Select multiple answers from options'
    },
    {
        id: 'descriptive',
        label: 'Descriptive',
        iconSource: '/icons/Descriptive.png',
        description: 'Open-ended text response'
    },
    {
        id: 'question-bank',
        label: 'Pick from Question Bank',
        iconSource: '/icons/PickFromQuestionBank.png',
        description: 'Select from existing questions'
    }
]

interface QuestionTypesDialogProps {
    isOpen: boolean
    onClose: () => void
    onSelectType: (type: string) => void
}

export function QuestionTypesDialog({
    isOpen,
    onClose,
    onSelectType
}: QuestionTypesDialogProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {

            // Check if the clicked element is the More button or its children
            const target = event.target as Element
            const moreButton = target.closest('button')

            if (moreButton && moreButton.textContent?.trim() === 'Add Question') {
                return
            }

            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            // Use a small delay to prevent immediate closing
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside)
            }, 100)

            return () => {
                clearTimeout(timer)
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={popupRef}
            className="absolute top-6 right-5/12 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] py-2 z-50"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside popup from bubbling
        >
            <div className="flex flex-col px-4">
                {questionTypes.map((type, index) => (
                    <React.Fragment key={type.id} >
                        <Button
                            variant="ghost"
                            className={cn(
                                "flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none",
                                index !== 3 && "border-b-1 border-off-white-4"
                            )}
                            onClick={() => {
                                onSelectType(type.id)
                                onClose()
                            }}
                        >
                            <Image
                                src={type.iconSource}
                                alt={type.id}
                                width={24}
                                height={24}
                            />
                            <span className="text-gray-700 text-sm">{type.label}</span>
                        </Button>

                    </React.Fragment>
                ))}

            </div>
        </div >
    )
}