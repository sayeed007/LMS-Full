"use client";

import { FileText, GraduationCap } from "lucide-react";
import Image from "next/image";
import React from "react";

// Mock Data
const sections = [
  {
    id: 1,
    title: "Submit Design Task",
    type: "assignment",
    stats: {
      yetToSubmit: 1,
      submitted: 15,
      evaluated: 3,
    },
  },
  {
    id: 2,
    title: "Assignment Task",
    type: "assignment",
    stats: {
      yetToSubmit: 0,
      submitted: 16,
      evaluated: 8,
    },
  },
  {
    id: 3,
    title: "Quiz Test",
    type: "quiz",
    stats: {
      yetToSubmit: 5,
      submitted: 11,
      evaluated: 4,
    },
  },
];

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <div className="text-gray-900 font-medium">
        Evaluate learner&apos;s submission for descriptive question and
        assignment task in this course.
      </div>

      <div className="space-y-4">
        {sections.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm border border-gray-100 gap-4"
          >
            {/* Left: Icon & Title */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.type === "quiz" ? "bg-blue-50" : "bg-red-50"
                }`}
              >
                {item.type === "quiz" ? (
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
              {/* Yet to Submit */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/icons/YetToSubmit.png"
                    alt="Yet to submit"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Yet to submit</span>
                  <span className="text-sm font-bold text-amber-500">
                    {item.stats.yetToSubmit}
                  </span>
                </div>
              </div>

              {/* Submitted */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/icons/Submitted.png"
                    alt="Submitted"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Submitted</span>
                  <span className="text-sm font-bold text-purple-600">
                    {item.stats.submitted}
                  </span>
                </div>
              </div>

              {/* Evaluated */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/icons/Evaluated.png"
                    alt="Evaluated"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Evaluated</span>
                  <span className="text-sm font-bold text-emerald-500">
                    {item.stats.evaluated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
