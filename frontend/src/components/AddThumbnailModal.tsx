import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

export function AddThumbnailModal({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (file: File | null) => void }) {
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
                <div className="text-2xl font-bold mb-6 text-dark">Add Thumbnail</div>
                <div className="mb-6">
                    <div className="font-semibold mb-2">Thumbnail</div>
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Thumbnail preview"
                            width={224}
                            height={160}
                            className="w-56 h-40 object-cover rounded-xl mb-2"
                        />
                    ) : (
                        <div className="w-56 h-40 bg-off-white-4 rounded-xl flex items-center justify-center mb-2 text-grey-2">No image</div>
                    )}
                    <div className="text-grey-2 text-sm mb-2">Size limit: 5 MB</div>
                    <div className="flex gap-4 items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? "Change Thumbnail" : "Upload Thumbnail"}
                        </button>
                        {file && (
                            <button type="button" className="text-dark ml-2" onClick={handleRemove}>Remove</button>
                        )}
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
                        disabled={!file}
                    >
                        Save
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 