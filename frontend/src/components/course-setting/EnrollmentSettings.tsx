import { Button } from "@/components/ui/button";
import React from "react";

interface EnrollmentSettingsProps {
  applicableFor: "all" | "department";
  setApplicableFor: (value: "all" | "department") => void;
}

export function EnrollmentSettings({
  applicableFor,
  setApplicableFor,
}: EnrollmentSettingsProps) {
  return (
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
  );
}
