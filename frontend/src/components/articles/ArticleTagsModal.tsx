import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton";
import PrimaryActionButton from "../ui/PrimaryButton";

interface ArticleTagsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (tags: string[]) => void;
    initialTags?: string[];
}

export function ArticleTagsModal({
    open,
    onOpenChange,
    onSave,
    initialTags = []
}: ArticleTagsModalProps) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [inputValue, setInputValue] = useState<string>('');

    const handleAddTag = () => {
        const trimmedValue = inputValue.trim().toLowerCase();
        if (trimmedValue && !tags.includes(trimmedValue)) {
            setTags([...tags, trimmedValue]);
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = () => {
        onSave(tags);
        onOpenChange(false);
    };

    const handleCancel = () => {
        // Reset to initial tags
        setTags(initialTags);
        setInputValue('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-8">
                <DialogHeader className="border-b-2 border-off-white-4">
                    <DialogTitle className="text-2xl font-bold text-dark mb-1">Manage Tags</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 my-6">
                    <p className="text-sm text-grey-2">
                        Add relevant tags to help categorize your article and improve discoverability.
                    </p>

                    {/* Tag Input */}
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter a tag and press Enter"
                            className="flex-1"
                        />
                        <button
                            onClick={handleAddTag}
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Add
                        </button>
                    </div>

                    {/* Tags Display */}
                    <div className="min-h-[100px] max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-3">
                        {tags.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                No tags added yet
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-blue-900 transition"
                                            title="Remove tag"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-grey-2">
                        Tags: {tags.length} • Recommended: 3-5 tags per article
                    </p>
                </div>

                <div className="flex gap-4 mt-2 justify-end">
                    <PrimaryOutlineButton onClick={handleCancel}>
                        Cancel
                    </PrimaryOutlineButton>

                    <PrimaryActionButton onClick={handleSave}>
                        Save Tags
                    </PrimaryActionButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
