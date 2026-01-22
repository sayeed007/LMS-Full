import { Button } from "@/components/ui/button";
import React, { useMemo, useState, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface Reminder {
  id: string; // Used for frontend key (might be _id from backend or temp id)
  name: string;
  type: string;
  via: string;
  active: boolean;
  message: string;
}

interface CourseRemindersProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  onSave: (updatedReminders?: Reminder[]) => void;
  isLoading?: boolean;
}

export function CourseReminders({
  reminders,
  setReminders,
  onSave,
}: CourseRemindersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Reminder>>({
    name: "",
    type: "enrollment",
    via: "email",
    active: true,
    message: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "enrollment",
      via: "email",
      active: true,
      message: "",
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const handleOpenEdit = useCallback(
    (e: React.MouseEvent, reminder: Reminder) => {
      setFormData(reminder);
      setEditingId(reminder.id);

      // Slight delay to allow dropdown to close completely before opening sheet
      // This prevents focus/pointer-event issues
      setTimeout(() => {
        setIsSheetOpen(true);
      }, 100);
    },
    [],
  );

  const handleSaveReminder = () => {
    if (!formData.name?.trim()) {
      toast.error("Reminder Name is required");
      return;
    }

    let newReminders: Reminder[];

    if (editingId) {
      // Update existing
      newReminders = reminders.map((r) =>
        r.id === editingId ? ({ ...r, ...formData } as Reminder) : r,
      );
      toast.success("Reminder updated");
    } else {
      // Add new
      const newReminder: Reminder = {
        id: `temp-${Date.now()}`,
        ...(formData as Omit<Reminder, "id">),
      };
      newReminders = [...reminders, newReminder];
      toast.success("Reminder added");
    }

    setReminders(newReminders);
    onSave(newReminders);
    setIsSheetOpen(false);
    resetForm();
  };

  const handleDelete = useCallback(
    (id: string) => {
      const newReminders = reminders.filter((r) => r.id !== id);
      setReminders(newReminders);
      onSave(newReminders);
      toast.success("Reminder deleted");
    },
    [reminders, setReminders, onSave],
  );

  const handleToggleActive = useCallback(
    (id: string, currentStatus: boolean) => {
      const newReminders = reminders.map((r) =>
        r.id === id ? { ...r, active: !currentStatus } : r,
      );
      setReminders(newReminders);
      onSave(newReminders);
    },
    [reminders, setReminders, onSave],
  );

  const columns: ColumnDef<Reminder>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <Badge variant="outline" className="capitalize">
              {type?.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "via",
        header: "Channel",
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("via")}</span>
        ),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!row.getValue("active")}
              onChange={() =>
                handleToggleActive(row.original.id, row.original.active)
              }
            />
            <span className="text-xs text-muted-foreground">
              {row.getValue("active") ? "Active" : "Inactive"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const reminder = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-46 px-2 bg-white border-0 shadow-xl rounded-lg overflow-hidden"
              >
                <DropdownMenuItem
                  onClick={(e) => handleOpenEdit(e, reminder)}
                  className="cursor-pointer py-3 px-4 text-gray-700 focus:text-blue-600 focus:bg-blue-50 border-b border-gray-100 rounded-none mx-0"
                >
                  <Image
                    src="/icons/Edit.png"
                    alt="Edit"
                    width={20}
                    height={20}
                    className="mr-3 w-5 h-5"
                  />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(reminder.id)}
                  className="cursor-pointer py-3 px-4 text-red-600 focus:text-red-600 focus:bg-red-50 rounded-none mx-0"
                >
                  <Image
                    src="/icons/Delete.png"
                    alt="Delete"
                    width={20}
                    height={20}
                    className="mr-3 w-5 h-5"
                  />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDelete, handleToggleActive, handleOpenEdit],
  );

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleOpenAdd} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <div className="border rounded-md">
        <DataTable columns={columns} data={reminders} />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent isOpen={isSheetOpen} className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Reminder" : "Add New Reminder"}
            </SheetTitle>
            <SheetDescription>
              Configure the details for this automated reminder.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Reminder Name</Label>
              <Input
                id="name"
                placeholder="e.g. 3 Days Before Expiry"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Trigger Event</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrollment">On Enrollment</SelectItem>
                  <SelectItem value="completion">On Completion</SelectItem>
                  <SelectItem value="expiry_3days">
                    3 Days Before Expiry
                  </SelectItem>
                  <SelectItem value="expiry_1day">
                    1 Day Before Expiry
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="via">Channel</Label>
              <Select
                value={formData.via}
                onValueChange={(val) => setFormData({ ...formData, via: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="notification">
                    In-App Notification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter the notification message..."
                className="resize-none"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-gray-500">
                  Enable or disable this reminder
                </p>
              </div>
              <Switch
                checked={!!formData.active}
                onChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReminder}
              className="bg-blue-600 text-white"
            >
              {editingId ? "Update Reminder" : "Add Reminder"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
