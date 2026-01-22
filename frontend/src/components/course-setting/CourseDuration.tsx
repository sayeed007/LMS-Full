import { Button } from "@/components/ui/button";
import { Clock3 } from "lucide-react";
import React from "react";

interface CourseDurationProps {
  durationHours: number;
  setDurationHours: (value: number) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  onSave: () => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

export function CourseDuration({
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  onSave,
  isLoading,
}: CourseDurationProps) {
  return (
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
