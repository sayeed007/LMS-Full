import { Button } from "@/components/ui/button";
import { LessonContent } from "@/types/backend-models";
import { Download } from "lucide-react";

interface DocumentContentRendererProps {
  content: LessonContent;
  onComplete: (contentId: string) => void;
}

export function DocumentContentRenderer({
  content,
  onComplete,
}: DocumentContentRendererProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-blue-600" />
          <div>
            <h4 className="font-medium text-gray-900">
              {content.title || "Document"}
            </h4>
            <p className="text-sm text-gray-600">
              {content.description || "Download this document to continue"}
            </p>
          </div>
        </div>
        {content.data.url && (
          <Button
            variant="outline"
            onClick={() => {
              window.open(content.data.url, "_blank");
              onComplete(content._id);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
