import { decodeHTMLEntities } from "@/lib/html-utils";
import { ContentBlockItem, LessonContent } from "@/types/backend-models";
import Image from "next/image";

interface BlockContentRendererProps {
  content: LessonContent;
}

export function BlockContentRenderer({ content }: BlockContentRendererProps) {
  const renderBlockItem = (blockItem: ContentBlockItem, index: number) => {
    return (
      <div
        key={blockItem._id || index}
        className="border-l-4 border-blue-200 pl-4"
      >
        <h4 className="font-medium text-gray-900 mb-2">
          {blockItem.data.title || `Block Item ${index + 1}`}
        </h4>
        <div className="text-gray-700 leading-relaxed">
          {blockItem.type === "text" && blockItem.data.text && (
            <div
              dangerouslySetInnerHTML={{
                __html: decodeHTMLEntities(blockItem.data.text),
              }}
            />
          )}
          {(blockItem.type === "image" ||
            blockItem.type === "video" ||
            blockItem.type === "audio") &&
            blockItem.data.url && (
              <div className="mb-2">
                {blockItem.type === "image" && (
                  <Image
                    src={blockItem.data.url}
                    alt={
                      blockItem.data.alt ||
                      blockItem.data.title ||
                      "Block content"
                    }
                    width={1200}
                    height={800}
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                {blockItem.type === "video" && (
                  <video controls className="w-full rounded-lg">
                    <source
                      src={blockItem.data.url}
                      type={blockItem.data.mimeType || "video/mp4"}
                    />
                  </video>
                )}
                {blockItem.type === "audio" && (
                  <audio controls className="w-full">
                    <source
                      src={blockItem.data.url}
                      type={blockItem.data.mimeType || "audio/mpeg"}
                    />
                  </audio>
                )}
              </div>
            )}
          {blockItem.data.description && (
            <p className="text-sm text-gray-600 mt-2">
              {blockItem.data.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {content.data.items?.map((blockItem, index) =>
        renderBlockItem(blockItem, index),
      ) || <p className="text-gray-600">No block content available</p>}
    </div>
  );
}
