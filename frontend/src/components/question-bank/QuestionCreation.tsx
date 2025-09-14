// components/questionBanks/questionBank-creation-options.tsx
"use client"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { GoBackRoute } from "../reports/GoBackRoute"
import { Input } from "../ui/input"
import PrimaryActionButton from "../ui/PrimaryButton"
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton"
import { SettingsPopup } from "./QuestionBankSettingsPopup"

export function QuestionCreation() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [questionBankName, setquestionBankName] = useState<string>(searchParams.get('name') || '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [questionBankContent, setquestionBankContent] = useState('');
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);

    const handlePreview = () => {
        if (!questionBankName.trim() || !questionBankContent.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        const params = new URLSearchParams();
        params.set('content', encodeURIComponent(''));
        params.set('title', encodeURIComponent(''));
        params.set('author', encodeURIComponent(''));
        params.set('category', encodeURIComponent(''));

        const url = `/questionBanks/preview/${encodeURIComponent(questionBankName)}?${params.toString()}`;

        router.push(url);
    };

    const handleSave = () => {

    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveSettings = (settings: any) => {
        console.log('Settings saved:', settings)
        // Handle the settings data here
        // You can send it to your API, update state, etc.
    }

    return (
        <>
            <div className="px-2 py-4">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    {/* LEFT - NAME */}
                    <div className="flex items-center gap-4 flex-2">
                        <GoBackRoute />
                        <div className="relative flex items-center gap-2 flex-2">
                            <Input
                                value={questionBankName}
                                onChange={(e) => {
                                    // Update URL with new name
                                    setquestionBankName(e.target.value);
                                    router.replace(`/questionBanks/create?name=${encodeURIComponent(e.target.value)}`)
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
                                    setquestionBankName('');
                                    router.replace(`/questionBanks/create?name=${encodeURIComponent('')}`)
                                }}
                            />
                        </div>
                    </div>

                    {/* RIGHT - Buttons */}
                    <div className="flex items-center justify-end gap-2 flex-1">

                        <div className="relative"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowSettingsPopup(prev => !prev);
                            }}
                        >
                            <PrimaryOutlineButton>
                                <Image
                                    src={'/icons/Settings.png'}
                                    alt={'Settings'}
                                    width={20}
                                    height={20}
                                />
                            </PrimaryOutlineButton>

                            {/* Settings popup */}
                            <SettingsPopup
                                isOpen={showSettingsPopup}
                                onClose={() => setShowSettingsPopup(false)}
                                onSave={handleSaveSettings}
                            />

                        </div>

                        <PrimaryOutlineButton
                            onClick={() => { handlePreview() }}>
                            Preview
                        </PrimaryOutlineButton>


                        <PrimaryActionButton
                            onClick={handleSave}
                        >
                            Save
                        </PrimaryActionButton>


                    </div>
                </div>
            </div>

            {/* Main Content */}

        </>
    )
}