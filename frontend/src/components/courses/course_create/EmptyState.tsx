import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";

interface EmptyStateProps {
    onCreateFirstLesson: () => void;
    onCreateFirstChapter: () => void;
}

export const EmptyState = ({ onCreateFirstLesson, onCreateFirstChapter }: EmptyStateProps) => (
    <div className="flex h-[50vh] flex-col justify-center items-center">
        <h1>Start Creating your course</h1>
        <p>Create a lesson or a chapter to get started with building your courses</p>
        <div className="flex gap-4 mt-2">
            <Button
                variant="outline"
                className="border border-blue-600 text-blue-600 flex items-center gap-2"
                onClick={onCreateFirstLesson}
            >
                <Plus size={16} /> Add Lesson
            </Button>
            <Button
                variant="outline"
                className="border border-blue-600 text-blue-600 flex items-center gap-2"
                onClick={onCreateFirstChapter}
            >
                <List size={16} /> Add Chapter
            </Button>
        </div>
    </div>
);