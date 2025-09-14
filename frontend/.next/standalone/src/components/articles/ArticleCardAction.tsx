// components/articles/article-more-option-popup.tsx
"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface ArticleCardActionProps {
    isOpen: boolean
    onClose: () => void
    onEditArticle: () => void
    onDuplicate: () => void
    onMandatoryRead: () => void
    onDeleteArticle: () => void
}

export function ArticleCardAction({
    isOpen,
    onClose,
    onEditArticle,
    onDuplicate,
    onMandatoryRead,
    onDeleteArticle
}: ArticleCardActionProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element

            // Check if the clicked element is the three dots action image or its parent
            const actionImage = target.closest('[data-action-trigger="true"]')
            const isActionImage = target.getAttribute('alt') === 'ActionThreeDots' ||
                target.getAttribute('src')?.includes('ActionThreeDots.png')

            if (actionImage || isActionImage) {
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
            className="absolute right-8 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] py-2 z-50"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside popup from bubbling
        >
            <div className="flex flex-col px-4">
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none border-b-1 border-off-white-4"
                    onClick={() => {
                        onEditArticle()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/Edit.png"
                        alt="Edit"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Edit Article</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none border-b-1 border-off-white-4"
                    onClick={() => {
                        onDuplicate()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/Duplicate.png"
                        alt="Duplicate"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Duplicate</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none border-b-1 border-off-white-4"
                    onClick={() => {
                        onMandatoryRead()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/MandatoryRead.png"
                        alt="MandatoryRead"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Mandatory Read</span>
                </Button>



                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none "
                    onClick={() => {
                        onDeleteArticle()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/Delete.png"
                        alt="Delete"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Delete Article</span>
                </Button>
            </div>
        </div>
    )
}