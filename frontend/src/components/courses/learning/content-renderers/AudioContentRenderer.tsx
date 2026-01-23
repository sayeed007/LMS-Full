import { LessonContent } from "@/types/backend-models";
import { Headphones } from "lucide-react";

interface AudioContentRendererProps {
  content: LessonContent;
  onComplete: (contentId: string) => void;
}

export function AudioContentRenderer({
  content,
  onComplete,
}: AudioContentRendererProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {content.data.url ? (
        <audio
          controls
          className="w-full"
          onEnded={() => onComplete(content._id)}
        >
          <source src={content.data.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className="text-center text-gray-500">
          <Headphones className="w-8 h-8 mx-auto mb-2" />
          <p>Audio not available</p>
        </div>
      )}
    </div>
  );
}
