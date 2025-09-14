import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Article } from "./ArticleCard";

export function CreateArticleModal({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (article: Omit<Article, 'id'>) => void }) {
    const [title, setTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ title, author: "Sufian Huzaif", date: new Date().toLocaleDateString(), views: 0, thumbnail: "/Thumbnail.png" });
        setTitle("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-8">
                <div className="text-2xl font-bold mb-6 text-dark">Create Article</div>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        className="border rounded-lg px-4 py-2 text-dark focus:outline-info"
                        placeholder="Article Name"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <div className="flex gap-4 mt-6 justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border text-dark hover:bg-off-white-4"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                        >
                            Create Now
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 