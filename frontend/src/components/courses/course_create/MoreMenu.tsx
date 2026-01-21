import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  useDeleteCourseMutation,
  useDuplicateCourseMutation,
} from "@/store/api/courseApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface MoreMenuProps {
  courseId: string;
}

export function MoreMenu({ courseId }: MoreMenuProps) {
  const router = useRouter();
  const [duplicateCourse, { isLoading: isDuplicating }] =
    useDuplicateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);

  const handleClone = async () => {
    try {
      const result = await duplicateCourse(courseId).unwrap();
      setShowCloneConfirm(false);
      showSuccessToast("Course cloned successfully!");
      if (result.data?.course?._id) {
        // Redirect to the new course
        router.push(`/courses/create/${result.data.course._id}/courseOutline`);
      }
    } catch (error) {
      console.error("Error cloning course:", error);
      showErrorToast("Failed to clone course");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(courseId).unwrap();
      showSuccessToast("Course deleted successfully!");
      router.push("/courses"); // Redirect to courses list
    } catch (error) {
      console.error("Error deleting course:", error);
      showErrorToast("Failed to delete course");
    }
  };

  const handleCloneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setTimeout(() => {
      setShowCloneConfirm(true);
    }, 100);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    setIsMenuOpen(false); // Close the dropdown immediately
    // Small delay to allow dropdown to fully close and body lock to clear
    setTimeout(() => {
      setShowDeleteConfirm(true);
    }, 100);
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border border-blue-600 text-blue-600 data-[state=open]:bg-blue-50"
          >
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-46 px-2 bg-white border-0 shadow-xl rounded-lg overflow-hidden"
        >
          <DropdownMenuItem
            onClick={handleCloneClick}
            disabled={isDuplicating}
            className="cursor-pointer py-3 px-4 text-blue-600 focus:text-blue-600 focus:bg-blue-50 border-b border-gray-100 rounded-none mx-0"
          >
            <Image
              src="/icons/Clone.png"
              alt="Clone"
              width={20}
              height={20}
              className="mr-3 w-5 h-5"
            />
            <span>Clone Course</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="cursor-pointer py-3 px-4 text-red-600 focus:text-red-600 focus:bg-red-50 rounded-none mx-0"
          >
            <Image
              src="/icons/Delete.png"
              alt="Delete"
              width={20}
              height={20}
              className="mr-3 w-5 h-5"
            />
            <span>Delete Course</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={showCloneConfirm}
        onOpenChange={(open) => !isDuplicating && setShowCloneConfirm(open)}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md p-0 overflow-hidden"
          onInteractOutside={(e) => isDuplicating && e.preventDefault()}
          onEscapeKeyDown={(e) => isDuplicating && e.preventDefault()}
        >
          <DialogTitle className="sr-only">Clone Course</DialogTitle>
          <DialogDescription className="sr-only">
            Are you sure you want to clone this course?
          </DialogDescription>
          <ConfirmDialog
            title="Clone Course"
            message="Are you sure you want to clone this course? A new copy will be created with 'Copy of' prefix."
            confirmText="Clone"
            cancelText="Cancel"
            variant="info"
            isLoading={isDuplicating}
            onConfirm={handleClone}
            onCancel={() => setShowCloneConfirm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !isDeleting && setShowDeleteConfirm(open)}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md p-0 overflow-hidden"
          onInteractOutside={(e) => isDeleting && e.preventDefault()}
          onEscapeKeyDown={(e) => isDeleting && e.preventDefault()}
        >
          <DialogTitle className="sr-only">Delete Course</DialogTitle>
          <DialogDescription className="sr-only">
            Are you sure you want to delete this course?
          </DialogDescription>
          <ConfirmDialog
            title="Delete Course"
            message="Are you sure you want to delete this course? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            isLoading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
