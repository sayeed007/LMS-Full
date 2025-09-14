"use client"
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const GoBackRoute = () => {
    const router = useRouter();

    return (
        <button className="cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </button>
    );
};