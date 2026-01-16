"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
interface ContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "document";
  content: string | { url?: string; text?: string; [key: string]: unknown };
  order: number;
}

interface BlocksModalProps {
  showBlocksModal: boolean;
  setShowBlocksModal: (value: boolean) => void;
  contentBlocks: ContentBlock[];
  showLessonOptions: boolean;
  setShowLessonOptions: (value: boolean) => void;
  addContentBlock: (type: ContentBlock["type"]) => void;
}

export default function BlocksModal({
  showBlocksModal,
  setShowBlocksModal,
  contentBlocks,
  showLessonOptions,
  setShowLessonOptions,
  addContentBlock,
}: BlocksModalProps) {
  return (
    <Dialog open={showBlocksModal} onOpenChange={setShowBlocksModal}>
      <DialogContent className=" w-full p-0 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBlocksModal(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">Introduction to UI/UX</h2>
          </div>
          <Button className="bg-blue-600 text-white px-6">Save</Button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-medium mb-4">
              Add content to your blocks
            </h3>

            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 border-t border-dashed border-gray-300"></div>
              <Button
                variant="outline"
                className="mx-4 px-6"
                onClick={() => setShowLessonOptions(true)}
              >
                + Add Content
              </Button>
              <div className="flex-1 border-t border-dashed border-gray-300"></div>
            </div>

            {/* Content options popup for blocks */}
            {showLessonOptions && (
              <div className="absolute right-1/2 transform translate-x-1/2 z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-3"
                      onClick={() => {
                        setShowLessonOptions(false);
                        addContentBlock("text");
                      }}
                    >
                      <span className="text-blue-600 mr-2">Aa</span> Text
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-3"
                      onClick={() => {
                        setShowLessonOptions(false);
                        addContentBlock("image");
                      }}
                    >
                      <span className="text-green-600 mr-2">🖼️</span> Image
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-3"
                    >
                      <span className="text-purple-600 mr-2">▷</span> Video
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-3"
                    >
                      <span className="text-blue-600 mr-2">🎵</span> Audio
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-3"
                    >
                      <span className="text-purple-600 mr-2">📄</span> Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Render content blocks */}
          {contentBlocks.map((block, index) => (
            <div key={index} className="mb-8">
              {block.type === "text" && (
                <div>
                  {/* Toolbar for text block */}
                  <div className="flex items-center gap-2 p-2 border-b bg-gray-50 rounded-t">
                    <select className="px-2 py-1 border rounded text-sm">
                      <option>Roboto</option>
                    </select>
                    <select className="px-2 py-1 border rounded text-sm">
                      <option>12pt</option>
                    </select>
                    <Button variant="ghost" size="sm">
                      Aa
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i>I</i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <b>B</b>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <u>U</u>
                    </Button>
                  </div>
                  <textarea
                    className="w-full h-32 border border-t-0 rounded-b p-4 resize-none"
                    placeholder="Type here"
                  />
                </div>
              )}

              {block.type === "image" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="text-blue-500 text-4xl mb-4">🖼️</div>
                  <h4 className="font-medium mb-2">Upload Image</h4>
                  <p className="text-gray-500 text-sm mb-1">
                    Choose an image from your device.
                  </p>
                  <p className="text-gray-400 text-xs">
                    Maximum file upload size: 2 MB
                  </p>
                </div>
              )}

              {block.type === "video" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <div className="text-blue-500 text-4xl mb-4">📹</div>
                    <h4 className="font-medium mb-2">Upload Video</h4>
                    <p className="text-gray-500 text-sm">
                      Maximum Video upload size: 150 MB
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <div className="text-blue-500 text-4xl mb-4">💻</div>
                    <h4 className="font-medium mb-2">Embed Video</h4>
                    <p className="text-gray-500 text-sm">
                      Embed video from YouTube
                    </p>
                  </div>
                </div>
              )}

              {block.type === "audio" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="text-blue-500 text-4xl mb-4">🎵</div>
                  <h4 className="font-medium mb-2">Upload Audio File</h4>
                  <p className="text-gray-500 text-sm">
                    Choose an audio from your device.
                  </p>
                </div>
              )}

              {/* Add Content button after each block */}
              <div className="flex items-center justify-center mt-4">
                <div className="flex-1 border-t border-dashed border-gray-300"></div>
                <Button
                  variant="outline"
                  className="mx-4 px-6"
                  onClick={() => setShowLessonOptions(true)}
                >
                  + Add Content
                </Button>
                <div className="flex-1 border-t border-dashed border-gray-300"></div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
