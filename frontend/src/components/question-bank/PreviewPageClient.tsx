// PreviewPageClient.tsx - Client Component
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Course, courseQuestionData } from '@/dummyData/courseQuestionData'
import { cn } from '@/lib/utils'
import { Section } from '@/types'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PreviewPageClientProps {
    courseId: string
    sectionId: string
}

interface SectionInfo {
    id: string;
    title: string;
}

const singleCourseQuestionData = courseQuestionData[0];

export function PreviewPageClient({ courseId, sectionId }: PreviewPageClientProps) {
    const router = useRouter();
    const [previewData, setPreviewData] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [sectionList, setSectionList] = useState<SectionInfo[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedSectionDetails, setSelectedSectionDetails] = useState<Section | null>(null);

    useEffect(() => {
        // Initialize with dummy data or fetch real data based on courseId
        setPreviewData(singleCourseQuestionData);
        const collectSectionList: SectionInfo[] = singleCourseQuestionData.sections.map(section => ({
            id: section.id,
            title: section.title
        }));
        setSectionList(collectSectionList);

        // Set initial section based on sectionId prop or first section
        const initialSection = sectionId || collectSectionList[0]?.id || null;
        setSelectedSection(initialSection);
        setLoading(false);
    }, [sectionId]);

    useEffect(() => {
        if (selectedSection && previewData) {
            const section = previewData.sections.find(s => s.id === selectedSection) || null;
            setSelectedSectionDetails(section);
        } else {
            setSelectedSectionDetails(null);
        }
    }, [selectedSection, previewData]);

    const getQuestionTypeLabel = (type: string) => {
        const labels = {
            'single-choice': 'Single Choice',
            'multiple-choice': 'Multiple Choice',
            'descriptive': 'Descriptive',
            'question-bank': 'Question Bank'
        }
        return labels[type as keyof typeof labels] || type
    }

    const getQuestionTypeColor = (type: string) => {
        const colors = {
            'single-choice': 'bg-gray-400 text-white',
            'multiple-choice': 'bg-gray-400 text-white',
            'descriptive': 'bg-gray-400 text-white',
            'question-bank': 'bg-gray-400 text-white'
        }
        return colors[type as keyof typeof colors] || 'bg-gray-400 text-white'
    }

    const handleSaveClick = () => {
        // Handle save logic here
        console.log('Saving course:', courseId);
    }

    const handleAddQuestionsClick = () => {
        router.push(`/question-bank/courses/${courseId}/sections/${selectedSection}/questions`);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading preview...</p>
                </div>
            </div>
        )
    }

    if (!previewData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No preview data available</p>
                    <Button
                        onClick={() => router.back()}
                        className="mt-4"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            {previewData?.title}
                        </h1>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                            {previewData?.description}
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                    >
                        Save
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex min-h-[calc(100vh-120px)]">
                {/* Left Sidebar - Topics */}
                <div className="w-80 border-r border-gray-200 bg-white">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Topics</h3>
                        <div className="space-y-0">
                            {sectionList?.map((section) => (
                                <div
                                    key={section?.id}
                                    onClick={() => setSelectedSection(section?.id)}
                                    className={cn(
                                        'cursor-pointer py-4 px-0 border-b border-gray-200 text-gray-700 hover:text-gray-900 transition-colors',
                                        selectedSection === section?.id && 'border-b-2 border-blue-600 text-gray-900 font-medium'
                                    )}
                                >
                                    {section?.title}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-white">
                    <div className="p-6">
                        {/* Section Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {selectedSectionDetails?.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {selectedSectionDetails?.questions.length} question{selectedSectionDetails?.questions.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Questions */}
                        <div className="space-y-6">
                            {selectedSectionDetails?.questions.map((question, index) => (
                                <div key={question.id} className="bg-off-white-1 p-4 rounded-sm">
                                    {/* Question Header */}
                                    <div className="flex flex-col mb-4">
                                        <div className="flex space-x-3">
                                            <div className="w-6 h-6 border-2 border-gray-300 rounded-sm flex items-center justify-center bg-white">
                                                <span className="text-xs text-gray-500"></span>
                                            </div>
                                            <span className="text-base font-medium text-gray-900">
                                                {index + 1}. Question: {question.text || 'Untitled Question'}
                                            </span>
                                            <Badge className={getQuestionTypeColor(question.type)}>
                                                {getQuestionTypeLabel(question.type)}
                                            </Badge>
                                        </div>
                                        <div className="flex space-x-4 text-sm text-gray-600 ml-14 my-2">
                                            <span>Score {question.score}</span>
                                            <span>Time Limit {question.timeLimit > 0 ? `${question.timeLimit}:00` : '00:01:00'}</span>
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="ml-9">
                                        {/* Choices */}
                                        {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                                            <div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                                                    {question.choices.map((choice, choiceIndex) => (
                                                        <div key={choice.id} className="flex items-center space-x-2">
                                                            <span className="text-gray-700 font-medium">
                                                                {String.fromCharCode(65 + choiceIndex)})
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {choice.text || `Choice ${choiceIndex + 1}`}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-gray-700">
                                                        Answer: {question.choices
                                                            .filter(choice => choice.isCorrect)
                                                            .map((choice) => `${String.fromCharCode(65 + question.choices.indexOf(choice))}) ${choice.text}`)
                                                            .join(', ')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {question.type === 'descriptive' && (
                                            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <p className="text-gray-500 text-center">
                                                    Students will provide written answers here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {selectedSectionDetails?.questions.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No questions added yet</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleAddQuestionsClick}
                                        className="mt-4"
                                    >
                                        Add Questions
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}