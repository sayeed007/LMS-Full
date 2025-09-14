import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import PrimaryActionButton from "../ui/PrimaryButton";
import PrimaryOutlineButton from "../ui/PrimaryOutlineButton";

export function ArticleAddThumbnailModal({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (file: File | null) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = () => {
        onSave(file);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-8">

                <DialogHeader className="border-b-2 border-off-white-4">
                    <DialogTitle className="text-2xl font-bold text-dark mb-1"> Add Thumbnail</DialogTitle>
                </DialogHeader>

                <div className="mb-2">
                    <div className="font-semibold mb-2">Thumbnail</div>

                    <div className="flex items-center">
                        <div className="flex flex-col relative">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Thumbnail preview"
                                    width={224}
                                    height={160}
                                    className="w-56 h-40 object-cover rounded-xl mb-2 border-1 border-info"
                                />
                            ) : (
                                <div className="w-56 h-40 bg-off-white-4 rounded-xl flex items-center justify-center mb-2 text-grey-2">No image</div>
                            )}
                            <div className="text-grey-2 text-sm mb-2">Size limit: 5 MB</div>


                            {file && (
                                <div className="absolute right-2 top-2 bg-white cursor-pointer transform transition-transform duration-200 hover:scale-130"
                                    onClick={handleRemove}
                                >
                                    <Image
                                        src={'/icons/Delete.png'}
                                        alt="Delete"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 z-10"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-1 justify-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            <PrimaryActionButton
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? "Change Thumbnail" : "Upload Thumbnail"}
                            </PrimaryActionButton>
                        </div>
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
                        disabled={!file}
                    >
                        Save
                    </PrimaryActionButton>
                </div>
            </DialogContent>
        </Dialog>
    );
} 