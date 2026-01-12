import { showErrorToast } from "@/lib/toast-utils";
import { CoursePopulated } from "@/store/api/courseApi";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CourseCard({
  course,
  isOwner = false,
}: {
  course: CoursePopulated;
  isOwner?: boolean;
}) {
  const router = useRouter();

  const onClick = () => {
    try {
      // If user owns the course, navigate to edit page, otherwise to view page
      if (isOwner) {
        router.push(`/courses/create/${course._id}`);
      } else {
        router.push(`/courses/${course._id}`);
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Navigation Error", "Failed to navigate to page");
    }
  };
  console.log(course);
  return (
    <div
      className="bg-white rounded-2xl border-off-white-2 shadow-1 border p-2 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow "
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <Image
          src={course?.thumbnail || "/default-course-thumbnail.png"}
          alt={course.title}
          className="object-cover"
          fill
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-course-thumbnail.png";
          }}
        />
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold text-dark mb-1 flex items-center gap-2">
          {course.title}
        </div>
        {/* <div className="text-info text-xs font-semibold mb-2">
          {course.category}
        </div> */}
        <div className="text-grey-2 text-sm mb-2 line-clamp-2">
          {course.description}
        </div>
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="bg-off-white-4 text-dark px-2 py-1 rounded">
            {course.level}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-grey-2 mt-2">
        <span>⏱️ {course.duration || 0} mins</span>
        <span>📊 {course.level}</span>
        {course.stats?.totalEnrollments ? (
          <span>👥 {course.stats.totalEnrollments}</span>
        ) : null}
      </div>
    </div>
  );
}
