// components/articles/create-article-modal.tsx
"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

interface CreateArticleModalProps {
    onClose: () => void
}

export function CreateArticleModal({ onClose }: CreateArticleModalProps) {
    const [articleName, setArticleName] = useState("")
    const router = useRouter()

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleCreateNow()
    }

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

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && articleName.trim()) {
            handleCreateNow()
        }
    }

    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-200 pb-3">
                Create Article
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Name here"
                        value={articleName}
                        onChange={(e) => setArticleName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={!articleName.trim()}
                        className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Now
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
