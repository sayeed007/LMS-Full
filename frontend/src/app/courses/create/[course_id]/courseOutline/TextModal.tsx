"use client";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface TextModalProps {
  showTextModal: boolean;
  setShowTextModal: (value: boolean) => void;
}

export default function TextModal({
  showTextModal,
  setShowTextModal,
}: TextModalProps) {
  const [textContent, setTextContent] = useState<string>("");
  return (
    <Dialog open={showTextModal} onOpenChange={setShowTextModal}>
      <DialogContent className="w-[500px]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTextModal(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">Introduction to UI/UX</h2>
          </div>
          <Button className="bg-blue-600 text-white px-6">Save</Button>
        </div>|

        <div className="w-full">
          <RichTextEditor
            value={textContent}
            onChange={setTextContent}
            placeholder="Write something amazing..."
          />
        </div>

        {/* Add Attachment */}
        <div className="p-4 border-t">
          <Button variant="outline" className="text-blue-600 border-blue-600">
            📎 Add Attachment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
