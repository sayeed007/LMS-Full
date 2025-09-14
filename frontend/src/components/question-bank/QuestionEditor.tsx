// src\components\question-bank\QuestionEditor.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/utils'
import { Question, QuestionChoice } from '@/types'
import {
    GripVertical,
    Info
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'


interface QuestionEditorProps {
    question: Question
    onUpdate: (question: Question) => void
    onDelete: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
    const [localQuestion, setLocalQuestion] = useState<Question>(question)

    const updateQuestion = (updates: Partial<Question>) => {
        const updated = { ...localQuestion, ...updates }
        setLocalQuestion(updated)
        onUpdate(updated)
    }

    const addChoice = () => {
        const newChoice: QuestionChoice = {
            id: `choice-${Date.now()}`,
            text: '',
            isCorrect: false
        }
        updateQuestion({
            choices: [...localQuestion.choices, newChoice]
        })
    }

    const updateChoice = (choiceId: string, updates: Partial<QuestionChoice>) => {
        const updatedChoices = localQuestion.choices.map(choice =>
            choice.id === choiceId ? { ...choice, ...updates } : choice
        )
        updateQuestion({ choices: updatedChoices })
    }

    // const deleteChoice = (choiceId: string) => {
    //     const updatedChoices = localQuestion.choices.filter(choice => choice.id !== choiceId)
    //     updateQuestion({ choices: updatedChoices })
    // }

    const setCorrectAnswer = (choiceId: string) => {
        if (localQuestion.type === 'single-choice') {
            // For single choice, only one can be correct
            const updatedChoices = localQuestion.choices.map(choice => ({
                ...choice,
                isCorrect: choice.id === choiceId
            }))
            updateQuestion({ choices: updatedChoices })
        } else {
            // For multiple choice, toggle the selection
            updateChoice(choiceId, { isCorrect: !localQuestion.choices.find(c => c.id === choiceId)?.isCorrect })
        }
    }

    return (
        <Card className="mb-6 bg-white rounded-xl">
            <CardContent className="p-6">

                <div className='flex justify-between gap-4'>
                    {/* Icon */}
                    <div className='flex items-center'>
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    </div>

                    {/* Question Input */}
                    <div className='flex-1'>
                        <div className="text-sm font-medium text-gray-600 mb-2">
                            Question {question.id.split('-')[1]}

                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                                {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </div>

                        <div className="relative flex items-center gap-2">
                            <Input
                                id={`question-${question.id}`}
                                placeholder="Type your question here"
                                value={localQuestion.text}
                                onChange={(e) => updateQuestion({ text: e.target.value })}
                                className="mt-1"
                            />
                            <Image
                                src="/icons/Cross.png"
                                alt="Cross"
                                width={16}
                                height={16}
                                className="cursor-pointer absolute right-4 top-6 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                                onClick={() => updateQuestion({ text: '' })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                            <Switch
                                id={`required-${question.id}`}
                                checked={localQuestion.required}
                                onChange={(required) => updateQuestion({ required })}
                            />
                            <Label htmlFor={`required-${question.id}`} className='text-off-white-5 font-bold'>Required</Label>
                        </div>
                    </div>

                    {/* Score */}
                    <div className=''>
                        <div className="text-sm font-medium text-gray-600 mb-3">
                            Score
                        </div>
                        <Input
                            id={`score-${question.id}`}
                            type="number"
                            value={localQuestion.score}
                            onChange={(e) => updateQuestion({ score: parseInt(e.target.value) || 0 })}
                            className="w-40"
                            min="0"
                            placeholder='Enter question score'
                        />
                    </div>
                </div>


                <div className="ml-9 mt-4">
                    {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                        <div className="space-y-3">
                            {localQuestion.choices.map((choice, index) => (
                                <div key={choice.id} className='flex justify-between gap-4'>
                                    {/* Icon */}
                                    <div className='flex items-center mt-6'>
                                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                    </div>

                                    {/* Question Input */}
                                    <div className='flex w-full gap-4 flex-1'>
                                        <div className='flex-1'>
                                            <div className="text-sm font-medium text-gray-600 mb-2">
                                                Choice {index + 1}
                                            </div>

                                            <div className="relative">
                                                <Input
                                                    id={`choice-${choice.id}`}
                                                    placeholder={`Enter choice ${index + 1}`}
                                                    value={choice.text}
                                                    onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                                                    className="mt-1"
                                                />
                                                <Image
                                                    src="/icons/Cross.png"
                                                    alt="Cross"
                                                    width={16}
                                                    height={16}
                                                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                                                    onClick={() => { updateChoice(choice.id, { text: '' }) }}
                                                />
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className='w-[165px]'>
                                            <div className="text-sm font-medium text-gray-600 mb-2 invisible">
                                                Answer
                                            </div>

                                            <div
                                                className={cn(
                                                    "cursor-pointer flex items-center space-x-2 p-3 rounded-lg h-10",
                                                    choice.isCorrect ? "bg-success-bg" : "bg-off-white-2"
                                                )}
                                                onClick={() => setCorrectAnswer(choice.id)}
                                            >
                                                {question.type === 'single-choice' ? (
                                                    <input
                                                        id={`correct-${question.id}-${choice.id}`}
                                                        type="radio"
                                                        name={`correct-${question.id}`}
                                                        checked={choice.isCorrect}
                                                        onChange={() => setCorrectAnswer(choice.id)}
                                                        className="w-4 h-4"
                                                    />
                                                ) : (
                                                    <input
                                                        id={`correct-${question.id}-${choice.id}`}
                                                        type="checkbox"
                                                        checked={choice.isCorrect}
                                                        onChange={() => setCorrectAnswer(choice.id)}
                                                        className="w-4 h-4"
                                                    />
                                                )}
                                                <Label
                                                    htmlFor={`correct-${question.id}-${choice.id}`}
                                                    className={cn(
                                                        "text-sm  font-medium",
                                                        choice.isCorrect ? "text-success" : "text-grey-1"
                                                    )}
                                                >
                                                    Correct Answer
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={addChoice}
                                className="flex items-center cursor-pointer"
                            >
                                <Image
                                    src={'/icons/PlusCircle.png'}
                                    alt={'PlusCircle'}
                                    width={24}
                                    height={24}
                                    className='mr-2'
                                />
                                <span className='font-semibold text-blue-600 mt-1'>
                                    Add More Choice
                                </span>
                            </div>
                        </div>
                    )}

                    {question.type === 'descriptive' && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Info className="w-4 h-4" />
                                <span className="text-sm">This is a descriptive question. Students will provide written answers.</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}