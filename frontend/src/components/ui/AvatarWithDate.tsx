import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { getDateTimeFormat, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarWithDateProps {
  name?: string;
  avatar?: string;
  date?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showDate?: boolean;
  // dateFormat?: "relative" | "absolute";
}

export function AvatarWithDate({
  name = "Unknown User",
  avatar,
  date,
  size = "sm",
  className,
  showDate = true,
  // dateFormat = "absolute"
}: AvatarWithDateProps) {
  const sizeClasses = {
    sm: {
      avatar: "w-6 h-6 my-auto",
      text: "text-xs",
      dateText: "text-xs"
    },
    md: {
      avatar: "w-8 h-8 my-auto",
      text: "text-sm",
      dateText: "text-sm"
    },
    lg: {
      avatar: "w-10 h-10 my-auto",
      text: "text-base",
      dateText: "text-sm"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className={currentSize.avatar}>
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5">
        <span className={cn("font-medium text-gray-900", currentSize.text)}>
          {name}
        </span>
        {showDate && date && (
          <span className={cn("text-gray-500", currentSize.dateText)}>
            {getDateTimeFormat(date)}
          </span>
        )}
      </div>
    </div>
  );
}