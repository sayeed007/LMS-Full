"use client";

import {
  BellRing,
  BookOpenText,
  Clock3,
  Image as ImageIcon,
  Star,
  Tags,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { AccordionCard } from "@/components/course-setting/AccordionCard";
import { CourseAccess } from "@/components/course-setting/CourseAccess";
import { CourseBasicInfo } from "@/components/course-setting/CourseBasicInfo";
import { CourseBranding } from "@/components/course-setting/CourseBranding";
import { CourseCertificates } from "@/components/course-setting/CourseCertificates";
import { CourseDuration } from "@/components/course-setting/CourseDuration";
import { CourseRating } from "@/components/course-setting/CourseRating";
import {
  CourseReminders,
  Reminder,
} from "@/components/course-setting/CourseReminders";
import { CourseTags } from "@/components/course-setting/CourseTags";
import { DeleteCourse } from "@/components/course-setting/DeleteCourse";
import { EnrollmentSettings } from "@/components/course-setting/EnrollmentSettings";
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  UpdateCourseRequest,
} from "@/store/api/courseApi";
import type { CourseSettings } from "@/types/backend-models";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ExpireBaseType = "from_enrollment" | "from_publish" | "never";

export default function CourseSettings() {
  const params = useParams();
  const courseId = params?.course_id as string;

  const { data: courseData, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(courseId, {
      skip: !courseId,
    });

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const router = useRouter();

  // Local demo state (replace with your form states / react-hook-form)
  const [expanded, setExpanded] = useState<string | null>(null);

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  const [expireBase, setExpireBase] =
    useState<ExpireBaseType>("from_enrollment");
  const [expireDays, setExpireDays] = useState<number>(20);

  const [enrollmentVisibility, setEnrollmentVisibility] = useState<
    "public" | "organization"
  >("organization");
  const [applicableFor, setApplicableFor] = useState<"all" | "department">(
    "all",
  );

  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const [tags, setTags] = useState<string[]>([]);

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [ratingEnabled, setRatingEnabled] = useState<boolean>(true);
  const [certificateEnabled, setCertificateEnabled] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Sync state with fetched data
  useEffect(() => {
    if (courseData?.data?.course) {
      const course = courseData.data.course;
      setCourseName(course.title || "");
      setCourseDesc(course.description || "");
      setThumbnail(course.thumbnail || null);
      if (course.tags) setTags(course.tags);
      if (course.tags) setTags(course.tags);

      // Map settings
      if (course.settings?.expiration) {
        setExpireBase(course.settings.expiration.type || "never");
        setExpireDays(course.settings.expiration.days || 0);
      }
      if (course.settings?.visibility) {
        if (course.settings.visibility === "public") {
          setEnrollmentVisibility("public");
          setApplicableFor("all"); // Default when switching to organization
        } else {
          setEnrollmentVisibility("organization");
          setApplicableFor(
            course.settings.visibility === "private" ? "department" : "all",
          );
        }
      }
      if (course.settings?.reminders) {
        setReminders(
          course.settings.reminders.map((r, i) => ({
            ...r,
            id: `r${i}`, // Ensure ID for UI
            message: r.message || "",
          })),
        );
      }
      if (course.settings?.certificate) {
        setCertificateEnabled(course.settings.certificate.enabled || false);
      }
      if (course.settings?.allowReviews !== undefined) {
        setRatingEnabled(course.settings.allowReviews);
      }
      if (course.estimatedDuration) {
        // Stored in minutes
        const hours = Math.floor(course.estimatedDuration / 60);
        const minutes = course.estimatedDuration % 60;
        setDurationHours(hours);
        setDurationMinutes(minutes);
      } else {
        setDurationHours(0);
        setDurationMinutes(0);
      }
    }
  }, [courseData]);

  const handleDeleteCourse = React.useCallback(async () => {
    if (!courseId) return;
    try {
      await deleteCourse(courseId).unwrap();
      toast.success("Course deleted successfully");
      router.push("/courses"); // Redirect to list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course");
    }
  }, [courseId, deleteCourse, router]);

  const toggle = (key: string) =>
    setExpanded((prev) => (prev === key ? null : key));

  const handleUpdateCourse = React.useCallback(
    async (updates: UpdateCourseRequest) => {
      if (!courseId) return;
      try {
        await updateCourse({
          id: courseId,
          data: updates,
        }).unwrap();
        toast.success("Course updated successfully");
        setExpanded(null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update course");
      }
    },
    [courseId, updateCourse],
  );

  // --- Accordion meta ---
  const items = useMemo(
    () => [
      {
        key: "name",
        icon: <BookOpenText className="w-5 h-5 text-indigo-500" />,
        title: "Course Name & Description",
        subtitle: "Enter name & description for your course",
        content: (
          <CourseBasicInfo
            courseName={courseName}
            setCourseName={setCourseName}
            courseDesc={courseDesc}
            setCourseDesc={setCourseDesc}
            isLoading={isUpdating}
            onSave={() =>
              handleUpdateCourse({ title: courseName, description: courseDesc })
            }
          />
        ),
      },
      {
        key: "branding",
        icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
        title: "Course Branding",
        subtitle:
          "Add a banner image for the course. This image will be displayed in the course overview.",
        content: (
          <CourseBranding
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            isLoading={isUpdating}
            onSave={(url) => handleUpdateCourse({ thumbnail: url || "" })}
          />
        ),
      },
      {
        key: "expire",
        icon: <Clock3 className="w-5 h-5 text-green-600" />,
        title: "Expiration Time",
        subtitle: "Specify the course availability duration for learners.",
        content: (
          <CourseAccess
            expireBase={expireBase}
            setExpireBase={setExpireBase}
            expireDays={expireDays}
            setExpireDays={setExpireDays}
            isLoading={isUpdating}
            onSave={() => {
              const currentSettings = courseData?.data?.course?.settings || {};
              const updatedSettings = {
                ...currentSettings,
                expiration: {
                  type: expireBase,
                  days: expireDays,
                },
              };
              handleUpdateCourse({ settings: updatedSettings });
            }}
          />
        ),
      },
      {
        key: "enrollment",
        icon: <Users className="w-5 h-5 text-indigo-500" />,
        title: "Enrollment Setting",
        subtitle: "Choose the enrollment method for your course",
        content: (
          <EnrollmentSettings
            enrollmentVisibility={enrollmentVisibility}
            setEnrollmentVisibility={setEnrollmentVisibility}
            applicableFor={applicableFor}
            setApplicableFor={setApplicableFor}
            isLoading={isUpdating}
            onSave={() => {
              const currentSettings = courseData?.data?.course?.settings || {};
              let visibility: "public" | "organization" | "private";
              if (enrollmentVisibility === "public") {
                visibility = "public";
              } else {
                visibility =
                  applicableFor === "all" ? "organization" : "private";
              }
              const updatedSettings = { ...currentSettings, visibility };
              handleUpdateCourse({ settings: updatedSettings });
            }}
          />
        ),
      },
      {
        key: "duration",
        icon: <Clock3 className="w-5 h-5 text-purple-500" />,
        title: "Course Duration",
        subtitle:
          "Set the estimated duration (in days or hours) for course completion.",
        content: (
          <CourseDuration
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            isLoading={isUpdating}
            onSave={() => {
              const totalMinutes = durationHours * 60 + durationMinutes;
              handleUpdateCourse({ estimatedDuration: totalMinutes });
            }}
          />
        ),
      },
      {
        key: "tags",
        icon: <Tags className="w-5 h-5 text-indigo-500" />,
        title: "Tags",
        subtitle: "Use tag to easily find in search item",
        content: (
          <CourseTags
            tags={tags}
            setTags={setTags}
            isLoading={isUpdating}
            onSave={() => handleUpdateCourse({ tags })}
          />
        ),
      },
      {
        key: "reminder",
        icon: <BellRing className="w-5 h-5 text-indigo-500" />,
        title: "Course Reminder",
        subtitle: "Create and manage alerts for specific events in the course.",
        content: (
          <CourseReminders
            reminders={reminders}
            setReminders={setReminders}
            isLoading={isUpdating}
            onSave={(updatedReminders) => {
              const currentSettings = courseData?.data?.course?.settings || {};
              const sourceReminders = updatedReminders || reminders;
              // Strip IDs before saving if backend doesn't need them or keep them if schema has _id
              const remindersToSave = sourceReminders.map((r) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...rest } = r;
                return rest;
              });
              const updatedSettings = {
                ...currentSettings,
                reminders: remindersToSave,
              };
              handleUpdateCourse({ settings: updatedSettings });
            }}
          />
        ),
      },
      {
        key: "certificates",
        icon: <Trophy className="w-5 h-5 text-sky-600" />,
        title: "Certificates",
        subtitle:
          "Reward your learners with custom course completion certificates",
        content: (
          <CourseCertificates
            enabled={certificateEnabled}
            setEnabled={setCertificateEnabled}
            isLoading={isUpdating}
            onSave={() => {
              const currentSettings =
                courseData?.data?.course?.settings ||
                ({} as Partial<CourseSettings>);
              const updatedSettings = {
                ...currentSettings,
                certificate: {
                  ...(currentSettings.certificate || {}),
                  enabled: certificateEnabled,
                },
              };
              handleUpdateCourse({ settings: updatedSettings });
            }}
          />
        ),
      },
      {
        key: "rating",
        icon: <Star className="w-5 h-5 text-amber-500" />,
        title: "Course Rating",
        subtitle: "Choose whether learner can rate this course",
        content: (
          <CourseRating
            ratingEnabled={ratingEnabled}
            setRatingEnabled={setRatingEnabled}
            isLoading={isUpdating}
            onSave={() => {
              const currentSettings = courseData?.data?.course?.settings || {};
              const updatedSettings = {
                ...currentSettings,
                allowReviews: ratingEnabled,
              };
              handleUpdateCourse({ settings: updatedSettings });
            }}
          />
        ),
      },
      {
        key: "delete",
        icon: <Trash2 className="w-5 h-5 text-rose-500" />,
        title: "Delete Course",
        subtitle:
          "Deleting a course will delete it's content which cannot be recovered.",
        content: (
          <DeleteCourse onDelete={handleDeleteCourse} isLoading={isDeleting} />
        ),
      },
    ],
    [
      applicableFor,
      enrollmentVisibility,
      courseDesc,
      courseName,
      durationHours,
      durationMinutes,
      expireBase,
      expireDays,
      ratingEnabled,
      reminders,
      tags,
      thumbnail,
      isUpdating,
      handleUpdateCourse,
      courseData,
      certificateEnabled,
      isDeleting,
      handleDeleteCourse,
    ],
  );

  if (isLoadingCourse) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FD] rounded-xl p-3 sm:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {items.map((item) => (
          <AccordionCard
            key={item.key}
            expanded={expanded === item.key}
            onToggle={() => toggle(item.key)}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
          >
            {item.content}
          </AccordionCard>
        ))}
      </div>
    </div>
  );
}
