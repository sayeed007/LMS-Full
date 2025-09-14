// app/courses/[courseId]/page.tsx - Server Component

import { CoursePageClient } from "@/components/question-bank/CoursePageClient";

interface CoursePageProps {
    params: Promise<{
        courseId: string
    }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
    const resolvedParams = await params;

    return <CoursePageClient courseId={resolvedParams.courseId} />
}



// // Example: app/courses/[courseId]/page.tsx - Course Overview Page
// 'use client'

// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import { BookOpen, Clock, Plus, Users } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import { useState } from 'react'

// interface CoursePageProps {
//     params: Promise<{
//         courseId: string
//     }>;
// }

// export default async function CoursePage({ params }: CoursePageProps) {
//     const resolvedParams = await params;
//     const router = useRouter()
//     const [sections, setSections] = useState([
//         {
//             id: 'section-1',
//             title: 'Typography',
//             questionCount: 2,
//             completed: true
//         },
//         {
//             id: 'section-2',
//             title: 'Color Psychology',
//             questionCount: 0,
//             completed: false
//         },
//         {
//             id: 'section-3',
//             title: 'Spacing',
//             questionCount: 0,
//             completed: false
//         },
//         {
//             id: 'section-4',
//             title: 'White Space',
//             questionCount: 0,
//             completed: false
//         }
//     ])

//     const createNewSection = () => {
//         const newSection = {
//             id: `section-${Date.now()}`,
//             title: 'New Section',
//             questionCount: 0,
//             completed: false
//         }
//         setSections([...sections, newSection])
//     }

//     const navigateToQuestions = (sectionId: string) => {
//         router.push(`/question-bank/courses/${params.courseId}/sections/${sectionId}/questions`)
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="max-w-6xl mx-auto py-8 px-4">
//                 {/* Course Header */}
//                 <div className="bg-white rounded-lg shadow-sm mb-8">
//                     <div className="p-8">
//                         <div className="flex items-start justify-between">
//                             <div className="flex-1">
//                                 <h1 className="text-3xl font-bold text-gray-900 mb-4">
//                                     UI/UX Design Basic
//                                 </h1>
//                                 <p className="text-gray-600 mb-6 max-w-3xl">
//                                     UI/UX Design (Basic) introduces the core principles of creating user-friendly and
//                                     visually appealing digital experiences. You&apos;ll learn the fundamentals of user interface (UI)
//                                     and user experience (UX) design, including layout, color, typography, wireframing, and user flows.
//                                     Ideal for beginners looking to build a strong foundation in design thinking and usability.
//                                 </p>
//                                 <div className="flex items-center space-x-6 text-sm text-gray-600">
//                                     <div className="flex items-center space-x-2">
//                                         <BookOpen className="w-4 h-4" />
//                                         <span>{sections.length} Sections</span>
//                                     </div>
//                                     <div className="flex items-center space-x-2">
//                                         <Clock className="w-4 h-4" />
//                                         <span>Self-paced</span>
//                                     </div>
//                                     <div className="flex items-center space-x-2">
//                                         <Users className="w-4 h-4" />
//                                         <span>Beginner Level</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <Button className="bg-blue-600 hover:bg-blue-700">
//                                 Save Course
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Sections */}
//                 <div className="space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h2 className="text-2xl font-semibold">Course Sections</h2>
//                         <Button
//                             onClick={createNewSection}
//                             className="bg-blue-600 hover:bg-blue-700"
//                         >
//                             <Plus className="w-4 h-4 mr-2" />
//                             Add Section
//                         </Button>
//                     </div>

//                     <div className="grid gap-4">
//                         {sections.map((section) => (
//                             <Card key={section.id} className="hover:shadow-md transition-shadow">
//                                 <CardContent className="p-6">
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex items-center space-x-4">
//                                             <div>
//                                                 <h3 className="text-lg font-semibold text-gray-900">
//                                                     {section.title}
//                                                 </h3>
//                                                 <div className="flex items-center space-x-3 mt-2">
//                                                     <span className="text-sm text-gray-600">
//                                                         {section.questionCount} questions
//                                                     </span>
//                                                     <Badge
//                                                         variant={section.completed ? "default" : "secondary"}
//                                                         className={section.completed ? "bg-green-100 text-green-800" : ""}
//                                                     >
//                                                         {section.completed ? "Complete" : "Draft"}
//                                                     </Badge>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center space-x-3">
//                                             <Button
//                                                 variant="outline"
//                                                 onClick={() => navigateToQuestions(section.id)}
//                                             >
//                                                 Edit Questions
//                                             </Button>
//                                             <Button
//                                                 variant="outline"
//                                                 onClick={() => router.push(`/question-bank/courses/${params.courseId}/sections/${section.id}/preview`)}
//                                                 disabled={section.questionCount === 0}
//                                             >
//                                                 Preview
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }