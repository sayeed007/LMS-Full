// components/EmptyState.tsx
import Image from "next/image";
import EmmptyContent from "@/gif/empty-box.gif";
import { Button } from "./ui/button";

interface EmptyStateWithCreateProps {
  message: string;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
}

export function EmptyStateWithCreate({
  message,
  description,
  buttonText,
  onClick,
}: EmptyStateWithCreateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="relative w-[160px] h-[140px] mb-6">
        <Image
          src={EmmptyContent}
          alt="Empty"
          width={160}
          height={140}
        />
      </div>
      <h3 className="text-lg font-semibold text-dark mb-2">{message}</h3>

      {description && (
        <p className="text-gray-500 text-sm mb-6">{description}</p>
      )}

      {onClick && buttonText && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className="cursor-pointer bg-info text-white px-6 py-2 rounded-lg font-medium shadow-drop hover:bg-info/90 transition"
        >
          {" "}
          {buttonText}
        </Button>
      )}
    </div>
  );
}
