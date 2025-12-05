"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreationFormProps {
    type: 'lesson' | 'chapter';
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
    placeholder: string;
    className?: string;
}

export const CreationForm = ({
    type,
    value,
    onChange,
    onSubmit,
    onCancel,
    isLoading,
    placeholder,
    className = ""
}: CreationFormProps) => {
    console.log(`Rendering CreationForm for ${type}`);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    const clearInput = () => {
        onChange("");
    };

    return (
        <div className={`flex items-center gap-3 mb-6 p-4 rounded-md bg-white ${className}`}>
            <div className="flex-1 relative">
                <Input
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="pr-20"
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                {value && (
                    <button
                        onClick={clearInput}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <Button
                onClick={onSubmit}
                disabled={isLoading || !value.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6"
            >
                {isLoading ? "Creating..." : "Create"}
            </Button>
            <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={onCancel}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
};