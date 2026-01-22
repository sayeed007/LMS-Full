import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  onSave: () => void;
  isLoading?: boolean;
}

export function CourseReminders({
  reminders,
  setReminders,
  onSave,
  isLoading,
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

  const handleOpenEdit = (reminder: Reminder) => {
    setFormData(reminder);
    setEditingId(reminder.id);
    setIsSheetOpen(true);
  };

  const handleSaveReminder = () => {
    if (!formData.name?.trim()) {
      toast.error("Reminder Name is required");
      return;
    }

    if (editingId) {
      // Update existing
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editingId ? ({ ...r, ...formData } as Reminder) : r,
        ),
      );
      toast.success("Reminder updated");
    } else {
      // Add new
      const newReminder: Reminder = {
        id: `temp-${Date.now()}`,
        ...(formData as Omit<Reminder, "id">),
      };
      setReminders((prev) => [...prev, newReminder]);
      toast.success("Reminder added");
    }
    setIsSheetOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reminder deleted");
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !currentStatus } : r)),
    );
  };

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
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenEdit(reminder)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleOpenAdd} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-600 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
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
