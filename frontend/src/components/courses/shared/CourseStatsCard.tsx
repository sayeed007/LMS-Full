import { Badge } from "@/components/ui/badge";
import { CoursePopulated } from "@/store/api/courseApi";

interface CourseStatsCardProps {
  course: Partial<CoursePopulated>;
  totalLessons: number;
  enrollment?: {
    progress: {
      completedLessons: string[];
      percentageComplete: number;
    };
    enrolledAt: Date;
    expiresAt?: Date;
  } | null;
  mode: "preview" | "detail" | "learning";
}

export function CourseStatsCard({
  course,
  totalLessons,
  enrollment,
  mode,
}: CourseStatsCardProps) {
  // Calculate stats based on enrollment
  const completionPercentage = enrollment?.progress?.percentageComplete || 0;
  const completedLessons = enrollment?.progress?.completedLessons?.length || 0;
  const incompleteLessons = totalLessons - completedLessons;

  // Calculate time left
  const getTimeLeft = () => {
    if (!enrollment?.expiresAt) return "--";

    const now = new Date();
    const expiryDate = new Date(enrollment.expiresAt);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 Day";
    return `${diffDays} Days`;
  };

  return (
    <div className="lg:w-96 flex flex-2 items-center mt-4 md:mt-0">
      <div
        className="text-white rounded-2xl p-4 relative overflow-hidden bg-cover bg-center min-h-[300px] w-full flex flex-col justify-between"
        style={{
          backgroundImage: `url(${
            course?.thumbnail || "/default-course-thumbnail.png"
          })`,
        }}
      >
        {/* Category Badge */}
        <div className="flex justify-end items-start mb-4">
          <Badge className="bg-white text-black border-white/30">
            {course.category || "Design & Development"}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center border-r-1 border-white">
            <div className="text-md font-bold mb-1">
              {mode === "preview"
                ? "0%"
                : `${Math.round(completionPercentage)}%`}
            </div>
            <div className="text-base text-gray-300">Completed</div>
          </div>
          <div className="text-center border-r-1 border-white">
            <div className="text-md font-bold mb-1">
              {mode === "preview" ? "--" : getTimeLeft()}
            </div>
            <div className="text-base text-gray-300">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-md font-bold mb-1">
              {mode === "preview" ? totalLessons : incompleteLessons}
            </div>
            <div className="text-base text-gray-300">
              {mode === "preview" ? "Lessons" : "Incomplete"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
