// components/articles/article-card.tsx
import { cn, monthDateYearFormat } from "@/lib/utils"
import { Article } from "@/types"
import { Calendar, Eye } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ArticleCardAction } from "./ArticleCardAction"

interface ArticleCardProps {
    article: Article
    isMyArticle: boolean
    onClick?: () => void
}


export function ArticleCard({
    article,
    isMyArticle,
    onClick
}: ArticleCardProps) {
    const { thumbnail, title, author, publishDate, views, isPublished } = article;
    const { name, avatar, initials } = author;
    const [showActionPopup, setShowActionPopup] = useState<boolean>(false);

    const handleEditArticle = () => {

    };

    const handleMandatoryRead = () => {

    };

    const handleDuplicate = () => {

    };

    const handleDeleteArticle = () => {

    };


    return (
        <div
            className="bg-white rounded-2xl border-off-white-2 shadow-1 border p-2 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow "
            onClick={onClick}
        >
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <Image
                    src={thumbnail}
                    alt={title}
                    className="object-cover"
                    fill
                />

                {isMyArticle &&
                    <>
                        {/* Left POSITIONING - Publish Status */}
                        <div className={cn(
                            "z-10 absolute left-2 top-2 px-2 py-1 rounded-3xl text-xs",
                            isPublished ? 'bg-black text-white' : 'bg-warning-bg text-warning'
                        )}>
                            {isPublished ? 'Published' : 'Draft'}
                        </div>


                        {/* RIGHT POSITIONING - Action Buttons */}
                        <>
                            <div
                                className="z-10 absolute right-2 top-1 cursor-pointer p-1 rounded-full hover:bg-black/10 transition-all duration-200"
                                data-action-trigger="true"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionPopup(prev => {
                                        return !prev
                                    });
                                }}
                            >
                                <Image
                                    src={'/icons/ActionThreeDots.png'}
                                    alt={'ActionThreeDots'}
                                    height={24}
                                    width={24}
                                    className="transform transition-transform duration-200 hover:scale-130"
                                />
                            </div>

                            <ArticleCardAction
                                isOpen={showActionPopup}
                                onClose={() => {
                                    setShowActionPopup(false)
                                }}
                                onEditArticle={handleEditArticle}
                                onDuplicate={handleDuplicate}
                                onMandatoryRead={handleMandatoryRead}
                                onDeleteArticle={handleDeleteArticle}
                            />
                        </>
                    </>
                }


            </div>

            <div className="my-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {title}
                </h3>

                {!isMyArticle &&
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span>{name}</span>
                    </div>
                }
            </div>


            <div className="mt-4 flex justify-between py-2 border-t-1 border-off-white-5 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{monthDateYearFormat(publishDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{views}</span>
                </div>
            </div>
        </div>
    )
}