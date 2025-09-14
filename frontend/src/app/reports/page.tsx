import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card'

export default function ReportsPage() {
    const reportTypes = [
        {
            icon: "/icons/MyReport.png", // or .png
            title: "My Reports",
            name: 'my-report',
            description: "View and manage all your submitted reports, including progress summaries, feedback, and performance insights.",
            textColor: "text-green-700"
        },
        {
            icon: "/icons/IndividualCourseReport.png",
            title: "Individual Course Report",
            name: 'individual-course',
            description: "In-depth analytics for a specific course, including learner progress, completion rates, and assessment performance.",
            textColor: "text-purple-700"
        },
        {
            icon: "/icons/IndividualLearnerReport.png",
            title: "Individual Learner Report",
            name: 'individual-learner',
            description: "Detailed insights into a learner's progress, performance, and completion status across courses and assessments.",
            textColor: "text-cyan-700"
        },
        {
            icon: "/icons/MultipleCourseReport.png",
            title: "Multiple Course Report",
            name: 'multiple-course',
            description: "Summarized performance and engagement data across multiple courses, helping track overall learning trends.",
            textColor: "text-blue-700"
        },
        {
            icon: "/icons/MultipleLearnerReport.png",
            title: "Multiple Learner Report",
            name: 'multiple-learner',
            description: "A comprehensive overview of progress and performance metrics for multiple learners outcomes.",
            textColor: "text-indigo-700"
        },
        {
            icon: "/icons/ArticleOverview.png",
            title: "Article Overview",
            name: 'articles',
            description: "A summarized view of the article's viewer count & review statistics.",
            textColor: "text-orange-700"
        }
    ]

    return (
        <div className="space-y-6">

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report, index) => (
                    <Link href={`/reports/${report.name}`} key={index} className="group">
                        <Card className={`bg-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-1 border-white hover:border-opacity-60 h-full`}>
                            <CardContent className="pt-0 px-3 py-5">
                                <div className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
                                        <Image
                                            src={report.icon}
                                            alt={`${report.title} icon`}
                                            width={60}
                                            height={60}
                                            className="w-[60px] h-[60px]"
                                        />
                                    </div>
                                    <div className="flex flex-col h-full my-auto">
                                        <CardTitle className={`text-lg font-semibold mb-2 group-hover:${report.textColor} transition-colors`}>
                                            {report.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                            {report.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
































// import React from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
// import { BarChart3, BookOpen, Users, Lightbulb, FileText, TrendingUp } from 'lucide-react'
// import Link from 'next/link'
// import Layout from '@/components/Layout'

// export default function ReportsPage() {
//     const reportTypes = [
//         {
//             icon: <FileText className="h-6 w-6 text-green-600" />,
//             title: "My Reports",
//             name: 'my-report',
//             description: "View and manage all your submitted reports, including progress summaries, feedback, and performance insights."
//         },
//         {
//             icon: <BookOpen className="h-6 w-6 text-purple-600" />,
//             title: "Individual Course Report",
//             name: 'individual-course',
//             description: "In-depth analytics for a specific course, including learner progress, completion rates, and assessment performance."
//         },
//         {
//             icon: <BarChart3 className="h-6 w-6 text-cyan-600" />,
//             title: "Individual Learner Report",
//             name: 'individual-learner',
//             description: "Detailed insights into a learner's progress, performance, and completion status across courses and assessments."
//         },
//         {
//             icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
//             title: "Multiple Course Report",
//             name: 'multiple-course',
//             description: "Summarized performance and engagement data across multiple courses, helping track overall learning trends and course effectiveness."
//         },
//         {
//             icon: <Users className="h-6 w-6 text-cyan-600" />,
//             title: "Multiple Learner Report",
//             name: 'multiple-learner',
//             description: "A comprehensive overview of progress and performance metrics for multiple learners outcomes."
//         },
//         {
//             icon: <Lightbulb className="h-6 w-6 text-orange-600" />,
//             title: "Article Overview",
//             name: 'articles',
//             description: "A summarized view of the article's viewer count & review."
//         }
//     ]

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
//             {
//                 reportTypes.map((report, index) => (
//                     <Link href={`/reports/${report.name}`} key={index}>
//                         <Card className="cursor-pointer hover:shadow-md transition-shadow h-[135px]">
//                             <CardHeader>
//                                 <div className="flex items-start space-x-4" >
//                                     <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg" >
//                                         {report.icon}
//                                     </div>
//                                     <div className="flex-1" >
//                                         <CardTitle className="text-lg font-semibold text-gray-900" >
//                                             {report.title}
//                                         </CardTitle>
//                                         <CardDescription className="mt-2 text-sm text-gray-600 leading-relaxed" >
//                                             {report.description}
//                                         </CardDescription>
//                                     </div>
//                                 </div>
//                             </CardHeader>
//                         </Card>
//                     </Link>
//                 ))
//             }
//         </div>
//     )
// }