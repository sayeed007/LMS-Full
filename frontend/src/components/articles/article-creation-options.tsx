// components/articles/article-creation-options.tsx
"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { GoBackRoute } from "../reports/GoBackRoute"
import RichTextEditor from "../RichTextEditor"
import { Input } from "../ui/input"
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton"
import { MoreOptionsPopup } from "./article-more-option-popup"
import { ArticleAddThumbnailModal } from "./ArticleAddThumbnailModal"
import { ArticleAdvancedSettingModal } from "./ArticleAdvancedSettingModal"
import SimplePageContainer from "../layout/SimplePageContainer"
import { useCreateArticleMutation, useUpdateArticleMutation, useGetArticleCategoriesQuery, type CreateArticleRequest } from "@/store/api/articleApi"
import { useUploadImageMutation } from "@/store/api/uploadApi"
import { useSession } from "next-auth/react"
import {
    showSuccessToast,
    showErrorToast,
    showFormErrorToast,
    showValidationErrorToast,
    showFileUploadToast,
    showFileUploadSuccessToast,
    showFileUploadErrorToast,
    showSaveLoadingToast,
    showSaveSuccessToast,
    dismissToast,
    showAuthErrorToast,
    showFormSuccessToast
} from "@/lib/toast-utils"

export function ArticleCreationOptions() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    // Article state
    const [articleId, setArticleId] = useState<string | null>(null)
    const [articleName, setArticleName] = useState<string>(searchParams.get('name') || 'Untitled Article');
    const [articleContent, setArticleContent] = useState('');
    const [articleCategory, setArticleCategory] = useState('General');
    const [articleTags, setArticleTags] = useState<string[]>([]);
    const [articleThumbnail, setArticleThumbnail] = useState<string>('');
    const [articleStatus, setArticleStatus] = useState<'draft' | 'published'>('draft');
    const [articleVisibility, setArticleVisibility] = useState<'public' | 'private' | 'organization'>('public');

    // UI state
    const [showMorePopup, setShowMorePopup] = useState<boolean>(false);
    const [currentArticleWritingMethod, setCurrentArticleWritingMethod] = useState<'root' | 'scratch'>('root')
    const [showAddThumbnailModal, setShowAddThumbnailModal] = useState(false);
    const [showAdvanceSettingModal, setShowAdvanceSettingModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // API hooks
    const [createArticle] = useCreateArticleMutation();
    const [updateArticle] = useUpdateArticleMutation();
    const [uploadImage] = useUploadImageMutation();
    const { data: categoriesData } = useGetArticleCategoriesQuery();


    // Create or update article
    const saveArticle = async (status: 'draft' | 'published' = 'draft') => {
        // Validation
        if (!session) {
            showAuthErrorToast('You must be logged in to save articles');
            return;
        }

        if (!articleName.trim()) {
            showValidationErrorToast('Article Title');
            return;
        }

        if (status === 'published' && !articleContent.trim()) {
            showValidationErrorToast('Article Content');
            return;
        }

        setIsLoading(true);
        const loadingToastId = showSaveLoadingToast();

        try {
            const articleData: CreateArticleRequest = {
                title: articleName.trim(),
                content: articleContent,
                excerpt: articleContent ? articleContent.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : '',
                category: articleCategory,
                tags: articleTags,
                thumbnail: articleThumbnail,
                status,
                visibility: articleVisibility
            };

            if (articleId) {
                // Update existing article
                const result = await updateArticle({
                    id: articleId,
                    data: articleData
                }).unwrap();
                console.log('Article updated:', result);
            } else {
                // Create new article
                const result = await createArticle(articleData).unwrap();
                setArticleId(result.data?.article._id);
                console.log('Article created:', result);
            }

            dismissToast(loadingToastId);

            if (status === 'published') {
                showFormSuccessToast('Article published successfully! Your content is now live.');
                setTimeout(() => router.push('/articles'), 1500);
            } else {
                showSaveSuccessToast('Article saved as draft! You can continue editing anytime.');
            }
        } catch (error: any) {
            dismissToast(loadingToastId);
            console.error('Error saving article:', error);

            const errorMessage = error?.data?.message || 'Failed to save article. Please try again.';
            showFormErrorToast(errorMessage, () => saveArticle(status));
        }
        setIsLoading(false);
    };

    const handleStartFromScratch = () => {
        setCurrentArticleWritingMethod('scratch');
    }

    const handleReadyTemplate = () => {
        router.push(`/articles/edit?name=${encodeURIComponent(articleName)}&mode=template`)
    }

    const handleImportFile = () => {
        router.push(`/articles/edit?name=${encodeURIComponent(articleName)}&mode=import`)
    }

    const handlePublish = async () => {
        await saveArticle('published');
    }

    // More popup handlers
    const handleSaveAsDraft = async () => {
        await saveArticle('draft');
    }

    const handleMandatoryRead = () => {
        // Set article as mandatory read (could be a tag or special category)
        setArticleTags(prev => [...prev.filter(tag => tag !== 'mandatory'), 'mandatory']);
        showSuccessToast('Mandatory Read', 'Article has been marked as mandatory reading for all users.');
    }

    const handleAddThumbnail = () => {
        setShowAddThumbnailModal(true);
    };

    const handleSaveThumbnail = async (file?: File, url?: string) => {
        if (file) {
            const uploadToastId = showFileUploadToast(file.name);

            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('category', 'thumbnail');

                const result = await uploadImage(formData).unwrap();
                setArticleThumbnail(result.data?.url);

                dismissToast(uploadToastId);
                showFileUploadSuccessToast(file.name);
            } catch (error: any) {
                dismissToast(uploadToastId);
                console.error('Error uploading thumbnail:', error);

                const errorMessage = error?.data?.message || 'Failed to upload thumbnail. Please check file size and format.';
                showFileUploadErrorToast(errorMessage, () => handleSaveThumbnail(file));
            }
        } else if (url) {
            setArticleThumbnail(url);
            showSuccessToast('Thumbnail updated', 'Article thumbnail has been set successfully.');
        }
        setShowAddThumbnailModal(false);
    };

    const handleAdvancedSetting = () => {
        setShowAdvanceSettingModal(true);
    }

    const handleAdvancedSettingsSave = (settings: {
        category: string;
        tags: string[];
        visibility: 'public' | 'private' | 'organization';
    }) => {
        setArticleCategory(settings.category);
        setArticleTags(settings.tags);
        setArticleVisibility(settings.visibility);
        setShowAdvanceSettingModal(false);
    };

    const handlePreview = () => {
        if (!articleName.trim()) {
            showValidationErrorToast('Article Title');
            return;
        }

        if (!articleContent.trim()) {
            showValidationErrorToast('Article Content');
            return;
        }

        const params = new URLSearchParams();
        params.set('content', encodeURIComponent(articleContent));
        params.set('title', encodeURIComponent(articleName));
        params.set('author', encodeURIComponent(session?.user?.name || 'Anonymous'));
        params.set('category', encodeURIComponent(articleCategory));
        params.set('thumbnail', encodeURIComponent(articleThumbnail));

        const url = `/articles/preview/${encodeURIComponent(articleName)}?${params.toString()}`;
        router.push(url);
    };

    // Auto-save functionality
    useEffect(() => {
        if (currentArticleWritingMethod === 'scratch' && articleContent.trim() && articleName.trim()) {
            const autoSaveTimer = setTimeout(() => {
                if (session) {
                    saveArticle('draft').catch(console.error);
                }
            }, 30000); // Auto-save every 30 seconds

            return () => clearTimeout(autoSaveTimer);
        }
    }, [articleContent, articleName, session, currentArticleWritingMethod]);

    return (
        <SimplePageContainer containerSize="xl" containerPadding="none">

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-2">
                    <GoBackRoute />
                    <div className="relative flex items-center gap-2 flex-2">
                        <Input
                            value={articleName}
                            onChange={(e) => {
                                // Update URL with new name
                                setArticleName(e.target.value);
                                router.replace(`/articles/create?name=${encodeURIComponent(e.target.value)}`)
                            }}
                            className="flex-1 text-lg pr-10 font-medium bg-transparent outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:border focus:border-gray-300"
                        />
                        <Image
                            src="/icons/Cross.png"
                            alt="Cross"
                            width={16}
                            height={16}
                            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                            onClick={() => {
                                setArticleName('');
                                router.replace(`/articles/create?name=${encodeURIComponent('')}`)
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 flex-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { handlePublish() }}
                        disabled={isLoading || !articleName.trim() || !articleContent.trim()}
                        className="cursor-pointer bg-info text-white px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Publishing...' : 'Publish'}
                    </Button>

                    <PrimaryOutlineButton
                        onClick={() => { handlePreview() }}
                        disabled={isLoading || !articleName.trim() || !articleContent.trim()}
                        className={isLoading ? 'opacity-50' : ''}
                    >
                        Preview
                    </PrimaryOutlineButton>


                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMorePopup(prev => {
                                    return !prev
                                });
                            }}
                            className="cursor-pointer bg-background text-info border-1 border-info px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 hover:text-white transition"
                        >
                            More
                        </Button>

                        <MoreOptionsPopup
                            isOpen={showMorePopup}
                            onClose={() => {
                                setShowMorePopup(false)
                            }}
                            onSaveAsDraft={handleSaveAsDraft}
                            onMandatoryRead={handleMandatoryRead}
                            onAddThumbnail={handleAddThumbnail}
                            onAdvancedSetting={handleAdvancedSetting}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}

            {currentArticleWritingMethod === 'root' ?
                <div className="flex flex-col items-center justify-center min-h-[calc(80vh-80px)] px-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Start creating your article
                        </h1>
                        <p className="text-gray-600">
                            Create by your own or from ready template
                        </p>
                        {!session && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    ⚠️ You need to be logged in to save articles
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-6">
                        <Button
                            variant="outline"
                            className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
                            onClick={handleStartFromScratch}
                        >
                            <Image
                                src="/icons/StartFromScratch.png"
                                alt="StartFromScratch"
                                width={16}
                                height={16}
                            />
                            <span className="text-info">Start from scratch</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
                            onClick={handleReadyTemplate}
                        >
                            <Image
                                src="/icons/ReadyTemplate.png"
                                alt="ReadyTemplate"
                                width={16}
                                height={16}
                            />
                            <span className="text-info">Ready Template</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-3 h-auto p-3 min-w-[160px] border-1 border-info"
                            onClick={handleImportFile}
                        >
                            <Image
                                src="/icons/ImportFile.png"
                                alt="ImportFile"
                                width={16}
                                height={16}
                            />
                            <span className="text-info">Import File</span>
                        </Button>
                    </div>
                </div>
                :
                currentArticleWritingMethod === 'scratch' ?
                    <div className="container mx-auto p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Status: <span className="font-semibold">{articleStatus}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Category: <span className="font-semibold">{articleCategory}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Visibility: <span className="font-semibold">{articleVisibility}</span>
                                </div>
                            </div>
                            {isLoading && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                    Saving...
                                </div>
                            )}
                        </div>
                        <RichTextEditor
                            value={articleContent}
                            onChange={setArticleContent}
                            placeholder="Write something amazing..."
                        />
                    </div>
                    :
                    <></>
            }



            {/* Add Thumbnail Modal */}
            {showAddThumbnailModal &&
                <ArticleAddThumbnailModal
                    open={showAddThumbnailModal}
                    onOpenChange={setShowAddThumbnailModal}
                    onSave={handleSaveThumbnail}
                    currentThumbnail={articleThumbnail}
                />
            }

            {/* Advanced Settings Modal */}
            {showAdvanceSettingModal &&
                <ArticleAdvancedSettingModal
                    open={showAdvanceSettingModal}
                    onOpenChange={setShowAdvanceSettingModal}
                    onSave={handleAdvancedSettingsSave}
                    currentSettings={{
                        category: articleCategory,
                        tags: articleTags,
                        visibility: articleVisibility
                    }}
                    availableCategories={categoriesData?.data?.categories || []}
                />
            }


        </SimplePageContainer>
    )
}