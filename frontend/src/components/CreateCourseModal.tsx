import { CreateCategoryModal } from "@/components/CreateCategoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalActions } from "@/lib/modal-utils";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { getErrorMessage } from "@/lib/utils";
import { getCategoryOptions, useGetCategoriesQuery } from "@/store/api/categoryApi";
import { useCreateCourseMutation } from "@/store/api/courseApi";
import { Course } from "@/types/backend-models";
import { useFormik } from "formik";
import { Plus } from "lucide-react";
import Select from "react-select";
import * as Yup from "yup";


export function CreateCourseModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate?: (courseId: string) => void;
}) {
  const { openModal, closeModal } = useModalActions();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

  // Fetch categories from API
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery({
    isActive: true,
    limit: 100
  });

  const categories = categoriesResponse?.data || [];
  const categoryOptions = getCategoryOptions(categories);

  // Show error if categories failed to load
  if (categoriesError) {
    showErrorToast("Failed to load categories");
  };

  const {
    handleSubmit,
    handleChange,
    values,
    touched,
    errors,
    handleBlur,
    resetForm,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    initialValues: {
      name: "",
      category: categoryOptions.length > 0 ? categoryOptions[0] : null,
      description: "",
      difficulty: "Beginner",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Course name is required"),
      category: Yup.object().required("Category is required"),
      description: Yup.string().max(500).required("Description is required"),
      difficulty: Yup.string().required("Difficulty is required"),
    }),
    onSubmit: async (values) => {
      try {
        // Create course using API
        const result = await createCourse({
          title: values.name,
          description: values.description,
          category: (values.category?.value as Course['category']) || "programming",
          level: values.difficulty.toLowerCase() as "beginner" | "intermediate" | "advanced",
          language: "English", // Default language
          price: 0, // Default free course
          currency: "USD"
        }).unwrap();

        showSuccessToast("Course created successfully!");

        // Call optional onCreate callback with the course ID
        if (onCreate && result?.data?.course?._id) {
          onCreate(result.data.course._id);
        }

        resetForm();
        onClose();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error creating course:", error);
        showErrorToast(errorMessage || "Failed to create course");
      }
    },
  });

  const openCreateCategoryModal = () => {
    openModal(
      <CreateCategoryModal
        onClose={() => closeModal()}
      />,
      { size: 'md', position: 'center' }
    );
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Create Course
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Course Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            placeholder="Enter Name here"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full h-10 text-gray-800"
          />
          {touched.name && errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Course Category */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Course Category <span className="text-red-500">*</span>
          </label>
          <Select
            options={categoryOptions}
            value={values.category}
            onChange={(option) => setFieldValue("category", option)}
            onBlur={() => setFieldTouched("category", true)}
            isLoading={categoriesLoading}
            placeholder={categoriesLoading ? "Loading categories..." : "Select a category"}
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: "#E5E7EB",
                minHeight: "40px",
              }),
            }}
          />
          <div className="text-xs mt-1 text-gray-500">
            Not found in list?{" "}
            <button
              type="button"
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
              onClick={openCreateCategoryModal}
            >
              <Plus className="h-3 w-3" />
              Add New
            </button>
          </div>
          {touched.category && errors.category && (
            <p className="text-xs text-red-600 mt-1">
              {errors.category}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            maxLength={500}
            className="border rounded-lg px-4 py-2 w-full focus:outline-info text-gray-800"
            placeholder="Enter Name here"
          />
          <div className="text-xs text-gray-500 mt-1">
            Character Limit{" "}
            <span className="font-bold">{values.description.length}</span>/500
          </div>
          {touched.description && errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <div className="text-sm font-medium mb-2 text-gray-700">
            Difficulty <span className="text-red-500">*</span>
          </div>
          <div className="flex gap-6">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={values.difficulty === level}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                {level}
              </label>
            ))}
          </div>
          {touched.difficulty && errors.difficulty && (
            <p className="text-xs text-red-600 mt-1">{errors.difficulty}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            disabled={isCreating || categoriesLoading}
            className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Now"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onClose()}
            disabled={isCreating}
            className="text-gray-600 hover:text-gray-900 px-6 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
