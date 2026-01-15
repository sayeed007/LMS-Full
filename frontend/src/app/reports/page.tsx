import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../components/ui/card";
import { PageLayout } from "@/components/ui";

export default function ReportsPage() {
  const reportTypes = [
    {
      icon: "/icons/MyReport.png",
      title: "My Reports",
      name: "my-report",
      description:
        "View and manage all your submitted reports, including progress summaries, feedback, and performance insights.",
      textColor: "text-green-700",
    },
    {
      icon: "/icons/IndividualCourseReport.png",
      title: "Individual Course Report",
      name: "individual-course",
      description:
        "In-depth analytics for a specific course, including learner progress, completion rates, and assessment performance.",
      textColor: "text-purple-700",
    },
    {
      icon: "/icons/IndividualLearnerReport.png",
      title: "Individual Learner Report",
      name: "individual-learner",
      description:
        "Detailed insights into a learner's progress, performance, and completion status across courses and assessments.",
      textColor: "text-cyan-700",
    },
    {
      icon: "/icons/MultipleCourseReport.png",
      title: "Multiple Course Report",
      name: "multiple-course",
      description:
        "Summarized performance and engagement data across multiple courses, helping track overall learning trends.",
      textColor: "text-blue-700",
    },
    {
      icon: "/icons/MultipleLearnerReport.png",
      title: "Multiple Learner Report",
      name: "multiple-learner",
      description:
        "A comprehensive overview of progress and performance metrics for multiple learners outcomes.",
      textColor: "text-indigo-700",
    },
    {
      icon: "/icons/ArticleOverview.png",
      title: "Article Overview",
      name: "articles",
      description:
        "A summarized view of the article's viewer count & review statistics.",
      textColor: "text-orange-700",
    },
  ];

  return (
    <PageLayout title="Reports" className="my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Link href={`/reports/${report.name}`} key={index} className="group">
            <Card className="bg-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200 hover:border-gray-300 h-full">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={report.icon}
                      alt={`${report.title} icon`}
                      width={60}
                      height={60}
                      className="w-[60px] h-[60px]"
                    />
                  </div>
                  <div className="flex flex-col h-full my-auto">
                    <CardTitle
                      className={`text-lg font-semibold mb-2 group-hover:${report.textColor} transition-colors`}
                    >
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
    </PageLayout>
  );
}
