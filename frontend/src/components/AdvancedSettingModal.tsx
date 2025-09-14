import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export function AdvancedSettingModal({
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

    const handleCheckboxChange = (setter: (value: boolean | ((prev: boolean) => boolean)) => void) =>
        () => setter((prev: boolean) => !prev);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-8">
                <div className="text-2xl font-bold mb-6 text-dark">Advanced Setting</div>
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-xl">⭐</span>
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Rating</div>
                            <div className="text-grey-2 text-sm">Allow article rating</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={rating}
                            onChange={handleCheckboxChange(setRating)}
                            className="accent-info w-6 h-6"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xl">💬</span>
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Comments</div>
                            <div className="text-grey-2 text-sm">Allow comments for the readers</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={comments}
                            onChange={handleCheckboxChange(setComments)}
                            className="accent-info w-6 h-6"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xl">👁️</span>
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Article Views</div>
                            <div className="text-grey-2 text-sm">Display article views</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={views}
                            onChange={handleCheckboxChange(setViews)}
                            className="accent-info w-6 h-6"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xl">⬇️</span>
                        <div className="flex-1">
                            <div className="font-semibold text-dark">Article export</div>
                            <div className="text-grey-2 text-sm">Allow readers to export article</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={exportEnabled}
                            onChange={handleCheckboxChange(setExportEnabled)}
                            className="accent-info w-6 h-6"
                        />
                    </div>
                </div>
                <div className="flex gap-4 mt-6 justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border text-dark hover:bg-off-white-4"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}