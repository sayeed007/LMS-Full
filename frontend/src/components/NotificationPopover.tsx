"use client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from "next/image";
import React from "react";

const notifications = {
    new: [
        {
            avatar: "/avatars/avatar1.jpg",
            message: 'Course “SQL Fundamentals” has not been updated in 180 days.',
            time: "2 hours Ago",
        },
        {
            avatar: "/avatars/avatar2.jpg",
            message: 'Introduction to UX Design” has been submitted for publishing review.',
            time: "2 hours Ago",
        },
        {
            icon: "calendar",
            message: "System update scheduled for April 30, 2:00 AM – downtime expected.",
            time: "2 hours Ago",
        },
    ],
    yesterday: [
        {
            avatar: "/avatars/avatar3.jpg",
            message: 'Learner “John Doe” completed all courses in the “Frontend Developer Track.”',
            time: "2 hours Ago",
        },
        {
            avatar: "/avatars/avatar4.jpg",
            message: 'Course “Data Analytics Bootcamp” has been published and is now live.',
            time: "2 hours Ago",
        },
        {
            icon: "calendar",
            message: "Some users are experiencing issues accessing video modules.",
            time: "2 hours Ago",
        },
        {
            avatar: "/avatars/avatar5.jpg",
            message: 'Assignment submissions pending grading: 6 in “Python 101.”',
            time: "2 hours Ago",
        },
    ],
};

type Notification = {
    avatar?: string;
    icon?: string;
    message: string;
    time: string;
};

function NotificationItem({ avatar, icon, message, time }: Notification) {

    console.info(icon);

    return (
        <div className="flex items-start gap-4 py-4 border-b last:border-b-0 border-off-white-4">
            {avatar ? (
                <Image
                    src={avatar}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                />
            ) : (
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-off-white-4 text-info text-xl">
                    📅
                </span>
            )}
            <div>
                <div className="text-16 text-dark">{message}</div>
                <div className="text-13 text-grey-2 mt-1">{time}</div>
            </div>
        </div>
    );
}

export function NotificationPopover({ children }: { children: React.ReactNode }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-[80vw] max-w-lg p-0 mt-2 shadow-lg border border-off-white-4"
                sideOffset={8}
            >
                <div className="p-6 pb-2 border-b border-off-white-4 flex items-center justify-between">
                    <span className="text-20 font-semibold">Notification</span>
                </div>
                <div className="p-6 pt-2 max-h-[60vh] overflow-y-auto">
                    <div className="text-14 text-grey-2 mb-2">New</div>
                    <div className="bg-off-white-2 rounded-lg">
                        {notifications.new.map((n, i) => (
                            <NotificationItem key={i} {...n} />
                        ))}
                    </div>
                    <div className="text-14 text-grey-2 mt-6 mb-2">Yesterday</div>
                    <div>
                        {notifications.yesterday.map((n, i) => (
                            <NotificationItem key={i} {...n} />
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
} 