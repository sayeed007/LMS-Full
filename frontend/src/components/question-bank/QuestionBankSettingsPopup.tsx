// components/question-bank/QuestionBankSettingsPopup.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/Switch"
import { useEffect, useRef, useState } from "react"
import { CustomSelect } from "../ui/CustomSelect"
import PrimaryActionButton from "../ui/PrimaryButton"

interface SettingsPopupProps {
    isOpen: boolean
    onClose: () => void
    onSave: (settings: SettingsData) => void
}

interface SettingsData {
    passingScoreRequired: boolean
    passingScore: number
    quizAttemptTime: string
    quizTimeHours: number
    quizTimeMinutes: number
}

const quizAttemptOptions = [
    { value: 'unlimited', label: 'Unlimited' },
    { value: '1', label: '1 time' },
    { value: '2', label: '2 time' },
    { value: '3', label: '3 time' },
    { value: '5', label: '5 time' },
]

export function SettingsPopup({
    isOpen,
    onClose,
    onSave
}: SettingsPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    // Form state
    const [passingScoreRequired, setPassingScoreRequired] = useState(true)
    const [passingScore, setPassingScore] = useState(0)
    const [quizAttemptTime, setQuizAttemptTime] = useState('unlimited')
    const [quizTimeHours, setQuizTimeHours] = useState(0)
    const [quizTimeMinutes, setQuizTimeMinutes] = useState(0)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the clicked element is the Settings button or its children
            const target = event.target as Element
            const settingsButton = target.closest('button')

            // Check if it's the settings button by looking for the Settings.png image
            const hasSettingsIcon = settingsButton?.querySelector('img[alt="Settings"]')

            if (hasSettingsIcon) {
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

    const handleSave = () => {
        const settingsData: SettingsData = {
            passingScoreRequired,
            passingScore,
            quizAttemptTime,
            quizTimeHours,
            quizTimeMinutes
        }
        onSave(settingsData)
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            ref={popupRef}
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-off-white-4 w-[550px] p-6 z-50"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b-1 border-off-white-4">
                <h2 className="text-xl font-semibold text-gray-900">Setting</h2>
                <button
                    onClick={onClose}
                    className="cursor-pointer text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                    ×
                </button>
            </div>

            {/* Passing score required */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                            Passing score required to continue
                        </h3>
                        <p className="text-sm text-gray-500">
                            Learner can move on to the next lesson if they pass the quiz
                        </p>
                    </div>
                    <Switch
                        checked={passingScoreRequired}
                        onChange={setPassingScoreRequired}
                    />
                </div>
            </div>

            <hr className="border-off-white-4 mb-6" />

            {/* Passing score */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Passing score</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="5"
                            value={passingScore}
                            onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-off-white-4 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">out of 5</span>
                    </div>
                </div>
            </div>

            <hr className="border-off-white-4 mb-6" />

            {/* Quiz attempt time */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900">Quiz attempt time</h3>
                <CustomSelect
                    options={quizAttemptOptions}
                    value={quizAttemptTime}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setQuizAttemptTime(selectedOption)
                        }
                    }}
                    placeholder="Select attempt limit"
                />
            </div>

            <hr className="border-off-white-4 mb-6" />

            {/* Quiz time */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="flex-1 text-base font-bold text-gray-900">Quiz time</h3>
                <div className="flex flex-2 gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-2">Hours</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={quizTimeHours}
                                onChange={(e) => setQuizTimeHours(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-2">Minute</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={quizTimeMinutes}
                                onChange={(e) => setQuizTimeMinutes(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <PrimaryActionButton
                    onClick={handleSave}
                >
                    Save
                </PrimaryActionButton>
                <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                    Cancel
                </Button>
            </div>
        </div>
    )
}