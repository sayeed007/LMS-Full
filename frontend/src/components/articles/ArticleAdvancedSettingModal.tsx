import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton";
import PrimaryActionButton from "../ui/PrimaryButton";
import { Switch } from "../ui/Switch";

interface AdvancedSettings {
    rating: boolean;
    comments: boolean;
    views: boolean;
    exportEnabled: boolean;
}

interface AdvancedSettingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (settings: AdvancedSettings) => void;
    initial?: Partial<AdvancedSettings>;
}

export function ArticleAdvancedSettingModal({
    open,
    onOpenChange,
    onSave,
    initial
}: AdvancedSettingModalProps) {
    const [rating, setRating] = useState<boolean>(initial?.rating ?? true);
    const [comments, setComments] = useState<boolean>(initial?.comments ?? true);
    const [views, setViews] = useState<boolean>(initial?.views ?? true);
    const [exportEnabled, setExportEnabled] = useState<boolean>(initial?.exportEnabled ?? true);

    const handleSave = (): void => {
        onSave({ rating, comments, views, exportEnabled });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-8">

                <DialogHeader className="border-b-2 border-off-white-4">
                    <DialogTitle className="text-2xl font-bold text-dark mb-1">Advanced Setting</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Image
                            src={'/icons/Rating.png'}
                            alt="Rating"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />

                        <div className="flex-1">
                            <div className="font-semibold text-dark">Rating</div>
                            <div className="text-grey-2 text-sm">Allow article rating</div>
                        </div>
                        <Switch
                            checked={rating}
                            onChange={(checked) => setRating(checked)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Image
                            src={'/icons/Comments.png'}
                            alt="Comments"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Comments</div>
                            <div className="text-grey-2 text-sm">Allow comments for the readers</div>
                        </div>
                        <Switch
                            checked={comments}
                            onChange={(checked) => setComments(checked)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Image
                            src={'/icons/ArticleViews.png'}
                            alt="ArticleViews"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Article Views</div>
                            <div className="text-grey-2 text-sm">Display article views</div>
                        </div>
                        <Switch
                            checked={views}
                            onChange={(checked) => setViews(checked)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Image
                            src={'/icons/ArticleExport.png'}
                            alt="ArticleExport"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Article export</div>
                            <div className="text-grey-2 text-sm">Allow readers to export article</div>
                        </div>
                        <Switch
                            checked={exportEnabled}
                            onChange={(checked) => setExportEnabled(checked)}
                        />
                    </div>
                </div>


                <div className="flex gap-4 mt-2 justify-end">
                    <PrimaryOutlineButton
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </PrimaryOutlineButton>

                    <PrimaryActionButton
                        onClick={handleSave}
                    >
                        Save
                    </PrimaryActionButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}