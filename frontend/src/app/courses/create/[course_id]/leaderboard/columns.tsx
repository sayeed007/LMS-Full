"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export type LeaderboardUser = {
  rank: number;
  name: string;
  id: string;
  role: string;
  time: string;
  score: string;
  avatar: string;
};

export const columns: ColumnDef<LeaderboardUser>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => {
      return (
        <div className="w-12 h-12 flex items-center justify-center text-teal-600 bg-teal-50 rounded-lg text-xl font-bold">
          {row.getValue("rank")}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Learner",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div>
          <h4 className="font-bold text-gray-900">
            {user.name} - {user.id}
          </h4>
          <p className="text-gray-500 text-sm">{user.role}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "stats",
    header: "Stats",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg border border-purple-100">
            <Image
              src="/icons/Time_Spent.png"
              alt="Time"
              width={20}
              height={20}
            />
            <span className="font-medium">{user.time}</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg border border-yellow-100">
            <Image src="/icons/Badge.png" alt="Score" width={20} height={20} />
            <span className="font-medium">{user.score}</span>
          </div>
        </div>
      );
    },
  },
];
