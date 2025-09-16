import { cn } from "@/lib/utils"
import Image from "next/image"
import * as React from "react"

const Avatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement> & {
        src?: string;
        alt?: string;
    }
>(({ className, src, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    if (!src || error) {
        return null;
    }

    return (
        <Image
            ref={ref}
            src={src}
            alt={alt || ''}
            className={cn("aspect-square h-full w-full object-cover", className)}
            onError={() => setError(true)}
            {...props}
        />
    );
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full w-full p-2 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium select-none",
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarFallback, AvatarImage }

