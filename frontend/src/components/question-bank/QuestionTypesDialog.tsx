// src\components\question-bank\QuestionTypesDialog.tsx
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
    Circle,
    CheckSquare,
    FileText,
    Database
} from 'lucide-react'

interface QuestionType {
    id: string
    label: string
    icon: React.ReactNode
    description: string
}

const questionTypes: QuestionType[] = [
    {
        id: 'single-choice',
        label: 'Single Choice',
        icon: <Circle className="w-6 h-6 text-blue-500" />,
        description: 'Select one answer from multiple options'
    },
    {
        id: 'multiple-choice',
        label: 'Multiple Choice',
        icon: <CheckSquare className="w-6 h-6 text-green-500" />,
        description: 'Select multiple answers from options'
    },
    {
        id: 'descriptive',
        label: 'Descriptive',
        icon: <FileText className="w-6 h-6 text-orange-500" />,
        description: 'Open-ended text response'
    },
    {
        id: 'question-bank',
        label: 'Pick from Question Bank',
        icon: <Database className="w-6 h-6 text-purple-500" />,
        description: 'Select from existing questions'
    }
]

interface QuestionTypesDialogProps {
    onSelectType: (type: string) => void
}

export function QuestionTypesDialog({ onSelectType }: QuestionTypesDialogProps) {
    const [selectedType, setSelectedType] = useState<string>('')
    const [open, setOpen] = useState(false)

    const handleConfirm = () => {
        if (selectedType) {
            onSelectType(selectedType)
            setOpen(false)
            setSelectedType('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    + Add Question
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Question Type</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                        {questionTypes.map((type) => (
                            <div key={type.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                                <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-3 mb-1">
                                        {type.icon}
                                        <span className="font-medium">{type.label}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{type.description}</p>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedType}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Add Question
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}