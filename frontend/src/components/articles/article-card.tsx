// components/articles/article-card.tsx
import { cn, getErrorMessage, getInitials, monthDateYearFormat } from "@/lib/utils"
import {
    dismissToast,
    showDeleteSuccessToast,
    showErrorToast,
    showLoadingToast,
    showSuccessToast
} from "@/lib/toast-utils"
import {
    useDeleteArticleMutation,
    useDuplicateArticleMutation,
    useUpdateArticleMutation
} from "@/store/api/articleApi"
import { Article } from "@/types/backend-models"
import { Calendar, Eye, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ArticleCardAction } from "./ArticleCardAction"

interface ArticleCardProps {
    article: Article
    isMyArticle: boolean
    onClick?: () => void
    onArticleDeleted?: () => void
    onArticleUpdated?: () => void
}


export function ArticleCard({
    article,
    isMyArticle,
    onClick,
    onArticleDeleted,
    onArticleUpdated
}: ArticleCardProps) {
    const { thumbnail, title, author, publishedAt, views, isPublished } = article;
    const { name, avatar } = author || { name: '', avatar: '' };
    const [showActionPopup, setShowActionPopup] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    // API mutations
    const [deleteArticle] = useDeleteArticleMutation();
    const [duplicateArticle] = useDuplicateArticleMutation();
    // const [updateArticle] = useUpdateArticleMutation();

    const handleEditArticle = () => {
        try {
            setShowActionPopup(false);
            router.push(`/articles/edit/${article._id}`);
        } catch (error) {
            console.error(error);
            showErrorToast('Navigation Error', 'Failed to navigate to edit page');
        }
    };

    // const handleMandatoryRead = async () => {
    //     if (isLoading) return;

    //     try {
    //         setIsLoading('mandatory');
    //         setShowActionPopup(false);

    //         const toastId = showLoadingToast('Setting mandatory read status...');

    //         await updateArticle({
    //             id: article._id,
    //             data: {
    //                 // Assuming there's a mandatory field or visibility setting
    //                 // Adjust this based on your backend Article model
    //                 visibility: article.visibility === 'organization' ? 'public' : 'organization'
    //             }
    //         }).unwrap();

    //         dismissToast(toastId);
    //         showSuccessToast(
    //             'Mandatory Read Updated',
    //             `Article is now ${article.visibility === 'organization' ? 'public' : 'organization-only'}`
    //         );

    //         onArticleUpdated?.();
    //     } catch (error: any) {
    //         showErrorToast(
    //             'Failed to Update',
    //             error?.data?.message || 'Could not update mandatory read status'
    //         );
    //     } finally {
    //         setIsLoading(null);
    //     }
    // };

    const handleDuplicate = async () => {
        if (isLoading) return;

        try {
            setIsLoading('duplicate');
            setShowActionPopup(false);

            const toastId = showLoadingToast('Duplicating article...');

            const result = await duplicateArticle(article._id).unwrap();

            dismissToast(toastId);
            showSuccessToast(
                'Article Duplicated',
                `"${title}" has been duplicated successfully`
            );

            // Navigate to the new duplicated article for editing
            if (result?.data?.article?._id) {
                router.push(`/articles/edit/${result.data.article._id}`);
            } else {
                onArticleUpdated?.();
            }
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Could not duplicate the article');
            showErrorToast(
                'Duplication Failed',
                errorMessage
            );
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeleteArticle = async () => {
        if (isLoading) return;

        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setIsLoading('delete');
            setShowActionPopup(false);

            const toastId = showLoadingToast('Deleting article...');

            await deleteArticle(article._id).unwrap();

            dismissToast(toastId);
            showDeleteSuccessToast(`"${title}"`);

            onArticleDeleted?.();
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Could not duplicate the article');
            showErrorToast(
                'Deletion Failed',
                errorMessage
            );
        } finally {
            setIsLoading(null);
        }
    };


    return (
        <div
            className="bg-white rounded-2xl border-off-white-2 shadow-1 border p-2 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow "
            onClick={onClick}
        >
            <div className="relative aspect-video overflow-hidden rounded-t-xl">
                <Image
                    src={thumbnail || '/default-article-thumbnail.jpg'}
                    alt={title}
                    className="object-cover"
                    fill
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-article-thumbnail.jpg';
                    }}
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
                                className={cn(
                                    "z-10 absolute right-2 top-1 cursor-pointer p-1 rounded-full hover:bg-black/10 transition-all duration-200",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                                data-action-trigger="true"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isLoading) {
                                        setShowActionPopup(prev => !prev);
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                                ) : (
                                    <Image
                                        src={'/icons/ActionThreeDots.png'}
                                        alt={'ActionThreeDots'}
                                        height={24}
                                        width={24}
                                        className="transform transition-transform duration-200 hover:scale-130"
                                    />
                                )}
                            </div>

                            <ArticleCardAction
                                isOpen={showActionPopup}
                                onClose={() => {
                                    setShowActionPopup(false)
                                }}
                                onEditArticle={handleEditArticle}
                                onDuplicate={handleDuplicate}
                                // onMandatoryRead={handleMandatoryRead}
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
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={avatar} alt={`${name}'s avatar`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        <span>{name || 'N/A'}</span>
                    </div>
                }
            </div>


            <div className="mt-2 flex justify-between py-2 border-t-1 border-off-white-5 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{monthDateYearFormat(publishedAt || '')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{views}</span>
                </div>
            </div>
        </div>
    )
}