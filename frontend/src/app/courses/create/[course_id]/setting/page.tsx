"use client";

import { Button } from "@/components/ui/button";
import {
  BellRing,
  BookOpenText,
  ChevronDown,
  ChevronRight,
  Clock3,
  Image as ImageIcon,
  Star,
  Tags,
  Trash2,
  Trophy,
  Users
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { EnhancedSelect } from "@/components/ui/SearchableSelect";

type ExpireBaseType = "from_enrollment" | "from_publish" | "never";

function AccordionCard({
  expanded,
  onToggle,
  icon,
  title,
  subtitle,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left p-4"
      >
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-gray-100/80">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
        <div className="text-gray-500">
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && <div className="px-2 pb-4">{children}</div>}
    </div>
  );
}

export default function CourseSettings() {
  // Local demo state (replace with your form states / react-hook-form)
  const [expanded, setExpanded] = useState<string | null>(null);

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  const [expireBase, setExpireBase] = useState<ExpireBaseType>("from_enrollment");
  const [expireDays, setExpireDays] = useState<number>(20);

  const [applicableFor, setApplicableFor] = useState<"all" | "department">(
    "all"
  );

  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [thumbnail, setThumbnail] = useState<string | null>(
    "/course-thumb-demo.jpg"
  );

  const [ratingEnabled, setRatingEnabled] = useState<boolean>(true);

  const [reminders, setReminders] = useState<
    { id: string; name: string; type: string; via: string; active: boolean }[]
  >([
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

  // --- Tag input helpers ---
  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim().replace(/,$/, "");
      if (!value) return;
      if (!tags.includes(value)) setTags((t) => [...t, value]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  // --- Accordion meta ---
  const items = useMemo(
    () => [
      {
        key: "name",
        icon: <BookOpenText className="w-5 h-5 text-indigo-500" />,
        title: "Course Name & Description",
        subtitle: "Enter name & description for your course",
        content: (
          <div className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Course Name
                </label>
                <input
                  className="w-full h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter Name here"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={5}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter Name here"
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Character Limit {courseDesc.length}/500
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button className="bg-blue-600 text-white">Save</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
      {
        key: "branding",
        icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
        title: "Course Branding",
        subtitle:
          "Add a banner image for the course. This image will be displayed in the course overview.",
        content: (
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm font-semibold mb-3">Thumbnail</p>
            <div className="flex items-start gap-6">
              <div className="w-56 h-36 overflow-hidden rounded-xl border border-gray-200 bg-black/5">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt="thumb"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => document.getElementById("thumbInput")?.click()}
                  className="bg-blue-600 text-white"
                >
                  Change Thumbnail
                </Button>
                <input
                  id="thumbInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setThumbnail(url);
                  }}
                />
                <button
                  onClick={() => setThumbnail(null)}
                  className="text-gray-700"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Size limit: 5 MB</div>
          </div>
        ),
      },
      {
        key: "expire",
        icon: <Clock3 className="w-5 h-5 text-green-600" />,
        title: "Expiration Time",
        subtitle: "Specify the course availability duration for learners.",
        content: (
          <div className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Expire</label>
                <EnhancedSelect
                  value={expireBase}
                  onValueChange={(value) => value && setExpireBase(value as ExpireBaseType)}
                  placeholder="Select expiration type"
                  clearable={false}
                  options={[
                    { value: 'from_enrollment', label: 'From Enrollment Days' },
                    { value: 'from_publish', label: 'From Publish Date' },
                    { value: 'never', label: 'Never expires' }
                  ]}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expires after (×) Days
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={expireDays}
                    onChange={(e) => setExpireDays(Number(e.target.value))}
                  />
                  <Clock3 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button className="bg-blue-600 text-white">Save</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
      {
        key: "enrollment",
        icon: <Users className="w-5 h-5 text-indigo-500" />,
        title: "Enrollment Setting",
        subtitle: "Choose the enrollment method for your course",
        content: (
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm font-semibold mb-4">Applicable For</p>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicable"
                  className="accent-indigo-600"
                  checked={applicableFor === "all"}
                  onChange={() => setApplicableFor("all")}
                />
                <span>All Employee</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicable"
                  className="accent-indigo-600"
                  checked={applicableFor === "department"}
                  onChange={() => setApplicableFor("department")}
                />
                <span>Department</span>
              </label>
              <Button
                variant="outline"
                className="border border-blue-600 text-blue-600"
              >
                Advance Option
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button className="bg-blue-600 text-white">Save</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
      {
        key: "duration",
        icon: <Clock3 className="w-5 h-5 text-purple-500" />,
        title: "Course Duration",
        subtitle:
          "Set the estimated duration (in days or hours) for course completion.",
        content: (
          <div className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Hours</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                  />
                  <Clock3 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minute</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                  <Clock3 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button className="bg-blue-600 text-white">Save</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
      {
        key: "tags",
        icon: <Tags className="w-5 h-5 text-indigo-500" />,
        title: "Tags",
        subtitle: "Use tag to easily find in search item",
        content: (
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm font-medium mb-2">Add Tags</p>
            <div className="border rounded-md px-2 py-2 flex flex-wrap gap-2 min-h-[40px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-200"
                >
                  {t}
                  <button className="ml-1" onClick={() => removeTag(t)}>
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                className="flex-1 min-w-[120px] outline-none"
                placeholder="Add tags"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Type comma or press enter to add
            </div>
          </div>
        ),
      },
      {
        key: "reminder",
        icon: <BellRing className="w-5 h-5 text-indigo-500" />,
        title: "Course Reminder",
        subtitle: "Create and manage alerts for specific events in the course.",
        content: (
          <div className="px-4 pb-4 pt-2">
            <Button
              className="bg-blue-600 text-white mb-4"
              onClick={() => {
                const n = reminders.length + 1;
                setReminders((r) => [
                  ...r,
                  {
                    id: `r${n}`,
                    name: `Reminder ${n}`,
                    type: "Custom",
                    via: "Mail",
                    active: true,
                  },
                ]);
              }}
            >
              Add Reminder
            </Button>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Reminder Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Notify via
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3">{r.via}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-500">⋮</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        key: "certificates",
        icon: <Trophy className="w-5 h-5 text-sky-600" />,
        title: "Certificates",
        subtitle:
          "Reward your learners with custom course completion certificates",
        content: (
          <div className="px-4 pb-4 pt-2">
            <Button className="bg-blue-600 text-white">
              Create Certificate
            </Button>
            <button className="ml-4 text-gray-600">Cancel</button>
          </div>
        ),
      },
      {
        key: "rating",
        icon: <Star className="w-5 h-5 text-amber-500" />,
        title: "Course Rating",
        subtitle: "Choose whether learner can rate this course",
        content: (
          <div className="px-4 pb-4 pt-2">
            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                className="accent-indigo-600"
                checked={ratingEnabled}
                onChange={(e) => setRatingEnabled(e.target.checked)}
              />
              <span>Allow learners to rate this course</span>
            </label>
            <div className="flex items-center gap-4 mt-6">
              <Button className="bg-blue-600 text-white">Save</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
      {
        key: "delete",
        icon: <Trash2 className="w-5 h-5 text-rose-500" />,
        title: "Delete Course",
        subtitle:
          "Deleting a course will delete it's content which cannot be recovered.",
        content: (
          <div className="px-4 pb-5 pt-2">
            <p className="text-sm text-gray-600 mb-4">
              This action is permanent. Please confirm.
            </p>
            <div className="flex items-center gap-3">
              <Button className="bg-rose-600 text-white">Delete Course</Button>
              <button className="text-gray-600">Cancel</button>
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      applicableFor,
      courseDesc.length,
      courseName,
      durationHours,
      durationMinutes,
      expireBase,
      expireDays,
      ratingEnabled,
      reminders,
      tags,
      tagInput,
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
