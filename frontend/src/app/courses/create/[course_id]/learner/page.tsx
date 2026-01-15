"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Search, ChevronRight } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table"; // Reuse your custom table
import { StatusBadge } from "@/components/reports/StatusBadge"; // Reuse existing badge
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
type Learner = {
  id: string;
  name: string;
  learnerId: string;
  email: string;
  enrollDate: string;
  timeSpent: string;
  completedDate: string;
  completionPercentage: number;
  status: "Yet to Start" | "In Progress" | "Complete";
  avatarUrl?: string;
};

// --- Mock Data ---
const learnersData: Learner[] = [
  {
    id: "1",
    name: "Annette Black",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "--",
    timeSpent: "--",
    completedDate: "--",
    completionPercentage: 0,
    status: "Yet to Start",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    name: "Darrell Steward",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "--",
    timeSpent: "--",
    completedDate: "--",
    completionPercentage: 0,
    status: "Yet to Start",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    name: "Jerome Bell",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "--",
    timeSpent: "--",
    completedDate: "--",
    completionPercentage: 0,
    status: "Yet to Start",
    avatarUrl: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "4",
    name: "Cody Fisher",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "--",
    completionPercentage: 75,
    status: "In Progress",
    avatarUrl: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "5",
    name: "Savannah Nguyen",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "--",
    completionPercentage: 75,
    status: "In Progress",
    avatarUrl: "https://i.pravatar.cc/150?u=5",
  },
  {
    id: "6",
    name: "Kristin Watson",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "--",
    completionPercentage: 75,
    status: "In Progress",
    avatarUrl: "https://i.pravatar.cc/150?u=6",
  },
  {
    id: "7",
    name: "Floyd Miles",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "Jan 21, 2025",
    completionPercentage: 100,
    status: "Complete",
    avatarUrl: "https://i.pravatar.cc/150?u=7",
  },
  {
    id: "8",
    name: "Cameron Williamson",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "Jan 21, 2025",
    completionPercentage: 100,
    status: "Complete",
    avatarUrl: "https://i.pravatar.cc/150?u=8",
  },
  {
    id: "9",
    name: "Ralph Edwards",
    learnerId: "200065",
    email: "anneteblack@gmail.com",
    enrollDate: "Jan 21, 2025",
    timeSpent: "1 day 12 hours",
    completedDate: "Jan 21, 2025",
    completionPercentage: 100,
    status: "Complete",
    avatarUrl: "https://i.pravatar.cc/150?u=9",
  },
];

// --- Stats Config ---
const statsConfig = [
  {
    label: "Total Learner",
    value: "120",
    icon: "/icons/TotalLearner.png",
    bg: "bg-blue-50", // Light blue bg for icon container
  },
  {
    label: "Yet to start",
    value: "35",
    icon: "/icons/YetToStart.png",
    bg: "bg-orange-50",
  },
  {
    label: "In Progress",
    value: "45",
    icon: "/icons/InProgress.png",
    bg: "bg-purple-50",
  },
  {
    label: "Completed",
    value: "24",
    icon: "/icons/Completed.png",
    bg: "bg-green-50",
  },
];

export default function LearnersPage() {
  // --- Columns ---
  const columns: ColumnDef<Learner>[] = [
    {
      id: "sl",
      header: "SL",
      cell: ({ row, table }) => {
        // Calculate SL based on pagination if needed, for now just index + 1
        return (
          <span className="text-gray-500 font-medium ml-2">
            {row.index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Learner",
      cell: ({ row }) => {
        const learner = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={learner.avatarUrl} alt={learner.name} />
              <AvatarFallback>{learner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-blue-600 cursor-pointer hover:underline text-sm">
                {learner.name} |{" "}
                <span className="text-blue-400">{learner.learnerId}</span>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "enrollDate",
      header: "Enroll Date",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {row.getValue("enrollDate")}
        </span>
      ),
    },
    {
      accessorKey: "timeSpent",
      header: "Time Spent",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {row.getValue("timeSpent")}
        </span>
      ),
    },
    {
      accessorKey: "completedDate",
      header: "Completed Date",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {row.getValue("completedDate")}
        </span>
      ),
    },
    {
      accessorKey: "completionPercentage",
      header: "Completion Percentage",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {row.getValue("completionPercentage")}%
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.getValue("status")} />;
      },
    },
    {
      id: "actions",
      header: "",
      cell: () => {
        return (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 bg-white">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="border border-off-white-2 shadow-sm">
            <CardContent className="flex items-center p-4 gap-4">
              {/* Icon Box */}
              <div
                className={`flex items-center justify-center p-3 rounded-xl ${stat.bg} min-w-[50px] min-h-[50px]`}
              >
                <Image
                  src={stat.icon}
                  alt={stat.label}
                  width={28}
                  height={28}
                  className="object-contain" // ensure icon fits well
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-9 bg-white border-off-white-2"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
          Add Learner
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={learnersData}
          striped={true}
          outerBorder={false}
          headerBorder={false}
          rowBorder={true}
          borderColor="border-gray-100"
        />
      </div>
    </div>
  );
}
