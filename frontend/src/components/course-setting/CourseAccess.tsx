import { Button } from "@/components/ui/button";
import { EnhancedSelect } from "@/components/ui/SearchableSelect";
import { Clock3 } from "lucide-react";
import React from "react";

type ExpireBaseType = "from_enrollment" | "from_publish" | "never";

interface CourseAccessProps {
  expireBase: ExpireBaseType;
  setExpireBase: (value: ExpireBaseType) => void;
  expireDays: number;
  setExpireDays: (value: number) => void;
}

export function CourseAccess({
  expireBase,
  setExpireBase,
  expireDays,
  setExpireDays,
}: CourseAccessProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Expire</label>
          <EnhancedSelect
            value={expireBase}
            onValueChange={(value) =>
              value && setExpireBase(value as ExpireBaseType)
            }
            placeholder="Select expiration type"
            clearable={false}
            options={[
              { value: "from_enrollment", label: "From Enrollment Days" },
              { value: "from_publish", label: "From Publish Date" },
              { value: "never", label: "Never expires" },
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
  );
}
