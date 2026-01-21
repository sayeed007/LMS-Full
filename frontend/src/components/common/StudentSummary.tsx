import Image from "next/image";
import { cn } from "@/lib/utils";

interface StudentSummaryProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function StudentSummary({
  variant = "light",
  className,
}: StudentSummaryProps) {
  const isDark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex -space-x-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center relative",
              isDark
                ? "border-gray-900 bg-gray-800"
                : "border-white bg-gray-200"
            )}
          >
            <Image
              src={`https://i.pravatar.cc/100?img=${i + 10}`}
              alt="User"
              fill
              className={cn("object-cover", isDark && "opacity-80")}
            />
          </div>
        ))}
      </div>

      {isDark ? (
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-white">2k+ Students</span>
          <span className="text-xs text-gray-400">Joined this week</span>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Trusted by <span className="font-bold text-gray-900">10,000+</span>{" "}
          students worldwide
        </p>
      )}
    </div>
  );
}
