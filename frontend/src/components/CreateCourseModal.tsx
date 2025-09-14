import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CourseDetails } from "@/types";
import { useFormik } from "formik";
import Select from "react-select";
import * as Yup from "yup";

const categoryOptions = [
  { value: "Design & Development", label: "Design & Development" },
  { value: "Business & Management", label: "Business & Management" },
  { value: "Technology & Development", label: "Technology & Development" },
  {
    value: "Personal Development & Learning",
    label: "Personal Development & Learning",
  },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Data & Analytics", label: "Data & Analytics" },
  { value: "Design & Creative Arts", label: "Design & Creative Arts" },
];

export function CreateCourseModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (course: Omit<CourseDetails, "id">) => void;
}) {
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
      category: categoryOptions[0],
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
    onSubmit: (values) => {
      onCreate({
        name: values.name,
        category: values.category.value,
        description: values.description,
        difficulty: values.difficulty,
        chapters: 0,
        lessons: 0,
        quizzes: 0,
        image: "/Thumbnail.png",
      });
      resetForm();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-8 rounded-xl">
        <div className="text-xl font-bold mb-4 text-gray-900">
          Create Course
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Course Name
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
              Course Category
            </label>
            <Select
              options={categoryOptions}
              value={values.category}
              onChange={(option) => setFieldValue("category", option)}
              onBlur={() => setFieldTouched("category", true)}
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
                className="text-blue-600 font-semibold hover:underline"
                onClick={() => alert("Handle 'Add New' action")}
              >
                Add New
              </button>
            </div>
            {touched.category && errors.category && (
              <p className="text-xs text-red-600 mt-1">
                {errors?.category?.value}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Description
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
              Difficulty label
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
              className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
            >
              Create Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-900 px-6 py-2 font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
