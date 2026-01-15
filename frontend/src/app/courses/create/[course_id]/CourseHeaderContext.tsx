import { createContext } from "react";

export const CourseHeaderContext = createContext<{
  showHeaderActions: boolean;
  setShowHeaderActions: (value: boolean) => void;
}>({
  showHeaderActions: false,
  setShowHeaderActions: () => {},
});
