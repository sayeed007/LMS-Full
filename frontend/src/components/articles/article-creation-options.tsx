// components/articles/article-creation-options.tsx
"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { GoBackRoute } from "../reports/GoBackRoute"
import RichTextEditor from "../RichTextEditor"
import { Input } from "../ui/input"
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton"
import { MoreOptionsPopup } from "./article-more-option-popup"
import { ArticleAddThumbnailModal } from "./ArticleAddThumbnailModal"
import { ArticleAdvancedSettingModal } from "./ArticleAdvancedSettingModal"

export function ArticleCreationOptions() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [articleName, setArticleName] = useState<string>(searchParams.get('name') || 'Untitled Article');
    const [showMorePopup, setShowMorePopup] = useState<boolean>(false);
    const [articleContent, setArticleContent] = useState('');

    const [currentArticleWrittingMethod, setCurrentArticleWrittingMethod] = useState<'root' | 'scratch'>('root')
    const [showAddThumbnailModal, setShowAddThubnailModal] = useState(false);
    const [showAdvanceSettingModal, setShowAdvanceSettingModal] = useState(false);


    const handleStartFromScratch = () => {
        // router.push(`/articles/edit?name=${encodeURIComponent(articleName)}&mode=scratch`);
        setCurrentArticleWrittingMethod('scratch');
    }

    const handleReadyTemplate = () => {
        router.push(`/articles/edit?name=${encodeURIComponent(articleName)}&mode=template`)
    }

    const handleImportFile = () => {
        router.push(`/articles/edit?name=${encodeURIComponent(articleName)}&mode=import`)
    }



    const handlePublish = () => {
        router.push(`/articles/publish?name=${encodeURIComponent(articleName)}`)
    }

    // More popup handlers
    const handleSaveAsDraft = () => {
        // Implement save as draft logic
        console.log('Saving as draft...')
        // You can add your save logic here
    }

    const handleMandatoryRead = () => {
        // Implement mandatory read logic
        console.log('Setting as mandatory read...')
        // You can add your mandatory read logic here
    }

    const handleAddThumbnail = () => {
        setShowAddThubnailModal(true);
    };

    const handleSaveThumbnail = () => {
        setShowAddThubnailModal(false);
    };

    const handleAdvancedSetting = () => {
        setShowAdvanceSettingModal(true);
    }

    const handlePreview = () => {
        if (!articleName.trim() || !articleContent.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        const params = new URLSearchParams();
        params.set('content', encodeURIComponent(''));
        params.set('title', encodeURIComponent(''));
        params.set('author', encodeURIComponent(''));
        params.set('category', encodeURIComponent(''));

        const url = `/articles/preview/${encodeURIComponent(articleName)}?${params.toString()}`;

        router.push(url);
    };

    return (
        <>
            {/* Header */}
            <div className="px-2 py-4">
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
                            className="cursor-pointer bg-info text-white px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 transition"
                        >
                            Publish
                        </Button>

                        <PrimaryOutlineButton
                            onClick={() => { handlePreview() }}>
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
            </div>

            {/* Main Content */}

            {currentArticleWrittingMethod === 'root' ?
                <div className="flex flex-col items-center justify-center min-h-[calc(80vh-80px)] px-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Start creating your article
                        </h1>
                        <p className="text-gray-600">
                            Create by your own or from ready template
                        </p>
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
                currentArticleWrittingMethod === 'scratch' ?
                    <div className="container mx-auto p-6">
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
                    onOpenChange={setShowAddThubnailModal}
                    onSave={handleSaveThumbnail}
                />
            }


            {showAdvanceSettingModal &&
                <ArticleAdvancedSettingModal
                    open={showAdvanceSettingModal}
                    onOpenChange={setShowAdvanceSettingModal}
                    onSave={handleSaveThumbnail}
                />
            }


        </>
    )
}