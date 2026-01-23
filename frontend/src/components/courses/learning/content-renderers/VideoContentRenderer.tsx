import { LessonContent } from "@/types/backend-models";
import { Play } from "lucide-react";

interface VideoContentRendererProps {
  content: LessonContent;
  onComplete: (contentId: string) => void;
}

export function VideoContentRenderer({
  content,
  onComplete,
}: VideoContentRendererProps) {
  return (
    <div className="bg-black rounded-lg overflow-hidden aspect-video">
      {content.data.url ? (
        <video
          controls
          className="w-full h-full"
          onEnded={() => onComplete(content._id)}
        >
          <source src={content.data.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Video not available</p>
          </div>
        </div>
      )}
    </div>
  );
}
