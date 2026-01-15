import { Button } from "@/components/ui/button";
import React from "react";

export function CourseCertificates() {
  return (
    <div className="px-4 pb-4 pt-2">
      <Button className="bg-blue-600 text-white">Create Certificate</Button>
      <button className="ml-4 text-gray-600">Cancel</button>
    </div>
  );
}
