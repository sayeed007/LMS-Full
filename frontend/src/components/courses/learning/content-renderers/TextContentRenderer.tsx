import { decodeHTMLEntities } from "@/lib/html-utils";
import { LessonContent } from "@/types/backend-models";
import "react-quill-new/dist/quill.snow.css";

interface TextContentRendererProps {
  content: LessonContent;
}

export function TextContentRenderer({ content }: TextContentRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <div
        dangerouslySetInnerHTML={{
          __html: decodeHTMLEntities(content.data.text || ""),
        }}
        className="ql-editor"
      />
    </div>
  );
}
