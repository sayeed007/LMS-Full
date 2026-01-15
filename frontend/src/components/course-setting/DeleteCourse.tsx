import { Button } from "@/components/ui/button";
import React from "react";

export function DeleteCourse() {
  return (
    <div className="px-4 pb-5 pt-2">
      <p className="text-sm text-gray-600 mb-4">
        This action is permanent. Please confirm.
      </p>
      <div className="flex items-center gap-3">
        <Button className="bg-rose-600 text-white">Delete Course</Button>
        <button className="text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
