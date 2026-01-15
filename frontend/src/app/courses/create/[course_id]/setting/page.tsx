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
import React, { useMemo, useState } from "react";
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

type ExpireBaseType = "from_enrollment" | "from_publish" | "never";

export default function CourseSettings() {
  // Local demo state (replace with your form states / react-hook-form)
  const [expanded, setExpanded] = useState<string | null>(null);

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  const [expireBase, setExpireBase] =
    useState<ExpireBaseType>("from_enrollment");
  const [expireDays, setExpireDays] = useState<number>(20);

  const [applicableFor, setApplicableFor] = useState<"all" | "department">(
    "all"
  );

  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const [tags, setTags] = useState<string[]>([]);

  const [thumbnail, setThumbnail] = useState<string | null>(
    "/course-thumb-demo.jpg"
  );

  const [ratingEnabled, setRatingEnabled] = useState<boolean>(true);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "r1",
      name: "Reminder 1",
      type: "Days after course enrollment",
      via: "Mail",
      active: true,
    },
    {
      id: "r2",
      name: "Reminder 2",
      type: "Days before course expiration",
      via: "Notification",
      active: true,
    },
  ]);

  const toggle = (key: string) =>
    setExpanded((prev) => (prev === key ? null : key));

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
          <CourseBranding thumbnail={thumbnail} setThumbnail={setThumbnail} />
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
            applicableFor={applicableFor}
            setApplicableFor={setApplicableFor}
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
          />
        ),
      },
      {
        key: "tags",
        icon: <Tags className="w-5 h-5 text-indigo-500" />,
        title: "Tags",
        subtitle: "Use tag to easily find in search item",
        content: <CourseTags tags={tags} setTags={setTags} />,
      },
      {
        key: "reminder",
        icon: <BellRing className="w-5 h-5 text-indigo-500" />,
        title: "Course Reminder",
        subtitle: "Create and manage alerts for specific events in the course.",
        content: (
          <CourseReminders reminders={reminders} setReminders={setReminders} />
        ),
      },
      {
        key: "certificates",
        icon: <Trophy className="w-5 h-5 text-sky-600" />,
        title: "Certificates",
        subtitle:
          "Reward your learners with custom course completion certificates",
        content: <CourseCertificates />,
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
          />
        ),
      },
      {
        key: "delete",
        icon: <Trash2 className="w-5 h-5 text-rose-500" />,
        title: "Delete Course",
        subtitle:
          "Deleting a course will delete it's content which cannot be recovered.",
        content: <DeleteCourse />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      applicableFor,
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
    ]
  );

  return (
    <div className="bg-[#F7F8FD] rounded-xl p-3 sm:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
