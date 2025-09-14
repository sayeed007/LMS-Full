// components/articles/create-article-modal.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateArticleModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateArticleModal({ isOpen, onClose }: CreateArticleModalProps) {
    const [articleName, setArticleName] = useState("")
    const router = useRouter()

    const handleCreateNow = () => {
        if (articleName.trim()) {
            // Navigate to create article page with the name
            router.push(`/articles/create?name=${encodeURIComponent(articleName)}`)
            onClose()
        }
    }

    const handleCancel = () => {
        setArticleName("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader className="border-b-2 border-off-white-4">
                    <DialogTitle className="text-xl font-semibold">Create Article</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 ">
                            Article Name
                        </label>
                        <Input
                            placeholder="Enter Name here"
                            value={articleName}
                            onChange={(e) => setArticleName(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCreateNow}
                            disabled={!articleName.trim()}
                            className="cursor-pointer bg-info text-white px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 transition"
                        >
                            Create Now
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="px-8"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
