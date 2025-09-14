// components/articles/article-more-option-popup.tsx
"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface MoreOptionsPopupProps {
    isOpen: boolean
    onClose: () => void
    onSaveAsDraft: () => void
    onMandatoryRead: () => void
    onAddThumbnail: () => void
    onAdvancedSetting: () => void
}

export function MoreOptionsPopup({
    isOpen,
    onClose,
    onSaveAsDraft,
    onMandatoryRead,
    onAddThumbnail,
    onAdvancedSetting
}: MoreOptionsPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {

            // Check if the clicked element is the More button or its children
            const target = event.target as Element
            const moreButton = target.closest('button')

            if (moreButton && moreButton.textContent?.trim() === 'More') {
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
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] py-2 z-50"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside popup from bubbling
        >
            <div className="flex flex-col px-4">
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none border-b-1 border-off-white-4"
                    onClick={() => {
                        onSaveAsDraft()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/SaveAsDraft.png"
                        alt="SaveAsDraft"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Save as Draft</span>
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
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none border-b-1 border-off-white-4"
                    onClick={() => {
                        onAddThumbnail()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/AddThumbnail.png"
                        alt="AddThumbnail"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Add Thumbnail</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 py-3 text-left justify-start hover:bg-off-white-3 rounded-none"
                    onClick={() => {
                        onAdvancedSetting()
                        onClose()
                    }}
                >
                    <Image
                        src="/icons/AdvancedSetting.png"
                        alt="AdvancedSetting"
                        width={24}
                        height={24}
                    />
                    <span className="text-gray-700 text-sm">Advanced Setting</span>
                </Button>
            </div>
        </div>
    )
}