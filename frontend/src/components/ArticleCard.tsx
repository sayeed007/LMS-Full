import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Image from "next/image";

export type Article = {
    id: string;
    title: string;
    author: string;
    date: string;
    views: number;
    thumbnail: string;
};

export function ArticleCard({ article }: { article: Article }) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 hover:shadow-lg transition relative">
            <Image
                src={article.thumbnail}
                alt={article.title}
                width={250}
                height={140}
                className="h-[140px] w-full object-cover rounded-xl mb-3"
            />
            <div className="flex-1">
                <div className="text-base font-bold text-dark mb-1 line-clamp-2">{article.title}</div>
                <div className="flex items-center gap-2 text-xs text-grey-2 mb-1">
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-grey-2 flex items-center gap-1">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M1 12C1 12 5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#A0AEC0" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#A0AEC0" strokeWidth="2" /></svg>
                    {article.views}
                </span>
                <Popover open={showActions} onOpenChange={setShowActions}>
                    <PopoverTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-off-white-4 transition" aria-label="More actions">
                            <MoreHorizontal className="w-5 h-5 text-grey-2" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-0 rounded-xl shadow-lg bg-white">
                        <div className="flex flex-col divide-y divide-off-white-4">
                            <button className="flex items-center gap-3 px-5 py-4 text-dark hover:bg-off-white-4 transition text-base">
                                <span className="text-purple-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" /></svg></span>
                                Add Thumbnail
                            </button>
                            <button className="flex items-center gap-3 px-5 py-4 text-dark hover:bg-off-white-4 transition text-base">
                                <span className="text-blue-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 20v-6m0 0V4m0 10l3.5-3.5M12 14l-3.5-3.5" stroke="currentColor" strokeWidth="2" /></svg></span>
                                Advanced Setting
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
} 