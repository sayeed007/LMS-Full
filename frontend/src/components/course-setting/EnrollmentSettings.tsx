import { Button } from "@/components/ui/button";
import React from "react";

interface EnrollmentSettingsProps {
  enrollmentVisibility: "public" | "organization";
  setEnrollmentVisibility: (value: "public" | "organization") => void;
  applicableFor: "all" | "department";
  setApplicableFor: (value: "all" | "department") => void;
  onSave: () => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

export function EnrollmentSettings({
  enrollmentVisibility,
  setEnrollmentVisibility,
  applicableFor,
  setApplicableFor,
  onSave,
  isLoading,
}: EnrollmentSettingsProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-sm font-semibold mb-4">Course Visibility</p>
      <div className="flex items-center gap-8 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            className="accent-indigo-600"
            checked={enrollmentVisibility === "public"}
            onChange={() => setEnrollmentVisibility("public")}
          />
          <span>Public</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            className="accent-indigo-600"
            checked={enrollmentVisibility === "organization"}
            onChange={() => setEnrollmentVisibility("organization")}
          />
          <span>Organization</span>
        </label>
      </div>

      {enrollmentVisibility === "organization" && (
        <div className="ml-6 mt-4 border-l-2 border-gray-200 pl-4">
          <p className="text-sm font-semibold mb-3">Applicable For</p>
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
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-600 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
