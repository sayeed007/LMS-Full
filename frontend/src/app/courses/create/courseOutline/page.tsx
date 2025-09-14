"use client";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { CourseHeaderContext } from "../layout";
import BlocksModal from "./BlocksModal";
import ChapterCreation from "./ChapterCreation";
import ChapterList from "./ChapterList";
import ContentPopup from "./ContentPopup";
import LessonCreation from "./LessonCreation";
import LessonList from "./LessonList";
import TextModal from "./TextModal";

interface PopupPosition {
  x: number;
  y: number;
}

export interface ContentBlock {
  type: "text" | "image" | "video" | "audio" | "document";
  id: number;
}

export default function CourseOutline() {
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessons, setLessons] = useState<string[]>([]);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
  const [showLessonOptions, setShowLessonOptions] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({
    x: 0,
    y: 0,
  });
  const [popupTrigger, setPopupTrigger] = useState<string>("");
  const { setShowHeaderActions } = useContext(CourseHeaderContext);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showBlocksModal, setShowBlocksModal] = useState(false);
  // const [selectedContentType, setSelectedContentType] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  // Global escape key handler for all modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showLessonOptions) {
          setShowLessonOptions(false);
        } else if (showTextModal) {
          setShowTextModal(false);
        } else if (showBlocksModal) {
          setShowBlocksModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLessonOptions, showTextModal, showBlocksModal]);

  useEffect(() => {
    setShowHeaderActions(
      lessons.length > 0 ||
      isCreatingLesson ||
      chapters.length > 0 ||
      isCreatingChapter
    );
  }, [
    isCreatingLesson,
    lessons,
    chapters,
    isCreatingChapter,
    setShowHeaderActions,
  ]);

  const handleCreateLesson = (lessonName: string) => {
    setLessons([...lessons, lessonName]);
  };

  const handleDeleteLesson = (index: number) => {
    const updated = [...lessons];
    updated.splice(index, 1);
    setLessons(updated);
  };

  const handleCreateChapter = (chapterName: string) => {
    setChapters([...chapters, chapterName]);
  };

  const handleDeleteChapter = (index: number) => {
    const updated = [...chapters];
    updated.splice(index, 1);
    setChapters(updated);
  };

  const handleShowPopup = (event: React.MouseEvent, trigger: string) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10, // 10px to the right of the button
      y: rect.top,
    });
    setPopupTrigger(trigger);
    setShowLessonOptions(true);
  };

  const addContentBlock = (type: ContentBlock["type"]) => {
    setContentBlocks([...contentBlocks, { type, id: Date.now() }]);
  };

  const handleTextClick = () => {
    setShowTextModal(true);
    setShowLessonOptions(false);
  };

  const handleBlocksClick = () => {
    setShowBlocksModal(true);
    setShowLessonOptions(false);
  };

  const handleClosePopup = () => {
    setShowLessonOptions(false);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Lesson Creation */}
      <LessonCreation
        isCreatingLesson={isCreatingLesson}
        setIsCreatingLesson={setIsCreatingLesson}
        onCreateLesson={handleCreateLesson}
      />

      {/* Created Lessons */}
      <LessonList
        lessons={lessons}
        onDeleteLesson={handleDeleteLesson}
        onShowPopup={handleShowPopup}
      />

      {/* Chapter Creation */}
      <ChapterCreation
        isCreatingChapter={isCreatingChapter}
        setIsCreatingChapter={setIsCreatingChapter}
        onCreateChapter={handleCreateChapter}
      />

      {/* Created Chapters */}
      <ChapterList
        chapters={chapters}
        onDeleteChapter={handleDeleteChapter}
        onShowPopup={handleShowPopup}
      />

      {/* Popup for Add Lesson Content */}
      <ContentPopup
        showPopup={showLessonOptions}
        popupPosition={popupPosition}
        popupTrigger={popupTrigger}
        onTextClick={handleTextClick}
        onBlocksClick={handleBlocksClick}
        onClosePopup={handleClosePopup}
      />

      <div className="flex flex-col justify-center items-center">
        <h1>Start Creating your course</h1>
        <p>
          Create a lesson or a chapter to get started with building your courses
        </p>

        <div className="flex gap-4 mt-2">
          <Button
            variant="outline"
            className="border border-blue-600 text-blue-600 flex items-center gap-2"
            onClick={() => setIsCreatingLesson(true)}
          >
            <Plus size={16} /> Add Lesson
          </Button>
          <Button
            variant="outline"
            className="border border-blue-600 text-blue-600 flex items-center gap-2"
            onClick={() => setIsCreatingChapter(true)}
          >
            <List size={16} /> Add Chapter
          </Button>
        </div>
      </div>
      {/* Text Modal */}
      <TextModal
        showTextModal={showTextModal}
        setShowTextModal={setShowTextModal}
      />

      {/* Blocks Modal */}
      <BlocksModal
        showBlocksModal={showBlocksModal}
        setShowBlocksModal={setShowBlocksModal}
        contentBlocks={contentBlocks}
        showLessonOptions={showLessonOptions}
        setShowLessonOptions={setShowLessonOptions}
        addContentBlock={addContentBlock}
      />
    </div>
  );
}
