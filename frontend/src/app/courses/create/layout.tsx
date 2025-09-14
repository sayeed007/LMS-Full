"use client";

import { Button } from "@/components/ui/button";
import { createContext, useState } from "react";
import CourseOutline from "./courseOutline/page";
import Learners from "./learner/page";
import CourseSettings from "./setting/page";

export const CourseHeaderContext = createContext<{
  showHeaderActions: boolean;
  setShowHeaderActions: (value: boolean) => void;
}>({
  showHeaderActions: false,
  setShowHeaderActions: () => { },
});

const tabs = [
  { slug: "", label: "Course Outline" },
  { slug: "learners", label: "Learners" },
  { slug: "evaluation", label: "Evaluation" },
  { slug: "leaderboard", label: "Leaderboard" },
  { slug: "setting", label: "Setting" },
];

export default function CourseLayout() {
  const [activeTab, setActiveTab] = useState("outline");
  const [showHeaderActions, setShowHeaderActions] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "learners":
        return <Learners />;
      case "evaluation":
        return <div>Evaluation content...</div>;
      case "leaderboard":
        return <div>Leaderboard content...</div>;
      case "setting":
        return <CourseSettings />;
      default:
        return <CourseOutline />;
    }
  };

  return (
    <CourseHeaderContext.Provider
      value={{ showHeaderActions, setShowHeaderActions }}
    >
      <div className="min-h-screen px-6 pt-4">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-4 h-10">
          <div className="absolute left-1/2 -translate-x-1/2 font-bold text-xl">
            UI/UX Road Map
          </div>
          {showHeaderActions && (
            <div className="absolute right-0 flex gap-2">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                Publish
              </Button>
              <Button
                variant="outline"
                className="border border-blue-600 text-blue-600"
              >
                Preview
              </Button>
              <Button
                variant="outline"
                className="border border-blue-600 text-blue-600"
              >
                More
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-4 text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={
                activeTab === tab.slug
                  ? "border-b-2 border-indigo-500 pb-2 text-black font-semibold"
                  : "text-gray-500 pb-2 hover:text-black"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </CourseHeaderContext.Provider>
  );
}
