import { Button } from "@/components/ui/button";
import React from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./reminder-columns";

export interface Reminder {
  id: string;
  name: string;
  type: string;
  via: string;
  active: boolean;
}

interface CourseRemindersProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}

export function CourseReminders({
  reminders,
  setReminders,
}: CourseRemindersProps) {
  const addReminder = () => {
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
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <Button className="bg-blue-600 text-white mb-4" onClick={addReminder}>
        Add Reminder
      </Button>

      <DataTable columns={columns} data={reminders} striped={true} />
    </div>
  );
}
