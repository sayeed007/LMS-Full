'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Calendar, Eye } from "lucide-react";


interface ArticleAuthorInfoProps {
    authorName: string;
    authorAvatar: string;
    publishDate: string;
    publishTime: string;
    views?: number;
    comment?: string
}

export const ArticleAuthorInfo = ({ authorName, authorAvatar, publishDate, publishTime, views, comment }: ArticleAuthorInfoProps) => {

    const authorInitials = getInitials(authorName);
    return (
        <div className={cn(
            "flex gap-4 text-sm",
            !comment && 'items-center'
        )}>
            <Avatar className="w-8 h-8">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {authorInitials}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
                <div className="font-bold text-gray-900">{authorName}</div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{publishDate} | {publishTime}</span>
                    </div>

                    {views !== undefined && (
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-2xl">
                            <Eye className="w-4 h-4" />
                            <span>{views}</span>
                        </div>
                    )}
                </div>

                {comment &&
                    <p className="mt-3 text-gray-700 leading-relaxed">{comment}</p>
                }
            </div>


        </div>
    );
}