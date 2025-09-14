"use client";
import { useContext, useEffect, useState } from "react";
import CourseOutline from "./courseOutline/page";
import { CourseHeaderContext } from "./layout";

export default function CourseCreate() {
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [lessons, setLessons] = useState<string[]>([]);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  // const [showLessonOptions, setShowLessonOptions] = useState(false); // State for popup
  // const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  // const [popupTrigger, setPopupTrigger] = useState(""); // Track which button triggered popup
  const { setShowHeaderActions } = useContext(CourseHeaderContext);
  // const [showTextModal, setShowTextModal] = useState(false);
  // const [showBlocksModal, setShowBlocksModal] = useState(false);
  // const [selectedContentType, setSelectedContentType] = useState("");
  // const [contentBlocks, setContentBlocks] = useState([]);
  useEffect(() => {
    setShowHeaderActions(
      lessons.length > 0 ||
      isCreatingLesson ||
      chapters.length > 0 ||
      isCreatingChapter
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatingLesson, lessons, chapters, isCreatingChapter]);

  // const handleCreateLesson = () => {
  //   if (lessonName.trim()) {
  //     setLessons([...lessons, lessonName.trim()]);
  //     setLessonName("");
  //     setIsCreatingLesson(false);
  //   }
  // };

  // const handleDeleteLesson = (index: number) => {
  //   const updated = [...lessons];
  //   updated.splice(index, 1);
  //   setLessons(updated);
  // };

  // const handleCreateChapter = () => {
  //   if (chapterName.trim()) {
  //     setChapters([...chapters, chapterName.trim()]);
  //     setChapterName("");
  //     setIsCreatingChapter(false);
  //   }
  // };

  // const handleDeleteChapter = (index: number) => {
  //   const updated = [...chapters];
  //   updated.splice(index, 1);
  //   setChapters(updated);
  // };

  // const handleShowPopup = (event, trigger) => {
  //   const rect = event.target.getBoundingClientRect();
  //   setPopupPosition({
  //     x: rect.right + 10, // 10px to the right of the button
  //     y: rect.top,
  //   });
  //   setPopupTrigger(trigger);
  //   setShowLessonOptions(true);
  // };

  // const addContentBlock = (type) => {
  //   setContentBlocks([...contentBlocks, { type, id: Date.now() }]);
  // };
  return <CourseOutline />;
}
