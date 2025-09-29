"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCategoryMutation } from "@/store/api/categoryApi";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { useFormik } from "formik";
import { Folder, Hash, Palette } from "lucide-react";
import * as Yup from "yup";

interface CreateCategoryModalProps {
  onClose: () => void;
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

export function CreateCategoryModal({ onClose }: CreateCategoryModalProps) {
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const {
    handleSubmit,
    handleChange,
    values,
    touched,
    errors,
    handleBlur,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: {
      name: "",
      description: "",
      icon: "folder",
      color: "#3B82F6",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Category name must be at least 2 characters")
        .max(100, "Category name cannot exceed 100 characters")
        .matches(/^[a-zA-Z0-9\s&-]+$/, "Category name can only contain letters, numbers, spaces, & and -")
        .required("Category name is required"),
      description: Yup.string().max(500, "Description cannot exceed 500 characters"),
      icon: Yup.string().max(50, "Icon name cannot exceed 50 characters"),
      color: Yup.string()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color")
        .required("Color is required"),
    }),
    onSubmit: async (values) => {
      try {
        const result = await createCategory({
          name: values.name,
          description: values.description || undefined,
          icon: values.icon,
          color: values.color,
        }).unwrap();

        showSuccessToast(result.message || "Category created successfully");
        resetForm();
        onClose();
      } catch (error) {
        console.error("Error creating category:", error);
        const apiError = error as ApiError;
        showErrorToast(apiError?.data?.message || "Failed to create category");
      }
    },
  });

  // Common icon options
  const iconOptions = [
    { value: "folder", label: "Folder", icon: "📁" },
    { value: "book", label: "Book", icon: "📚" },
    { value: "code", label: "Code", icon: "💻" },
    { value: "design", label: "Design", icon: "🎨" },
    { value: "business", label: "Business", icon: "💼" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "health", label: "Health", icon: "🏥" },
    { value: "language", label: "Language", icon: "🗣️" },
    { value: "music", label: "Music", icon: "🎵" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "art", label: "Art", icon: "🖼️" },
    { value: "math", label: "Math", icon: "🧮" },
  ];

  // Common color options
  const colorOptions = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#EC4899", // Pink
    "#6B7280", // Gray
  ];

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
        <Folder className="h-5 w-5 text-blue-600" />
        Create Category
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Category Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            placeholder="e.g., Web Development"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full h-10 text-gray-800"
            disabled={isLoading}
          />
          {touched.name && errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
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
            rows={3}
            maxLength={500}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
            placeholder="Brief description of the category..."
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">
            Character Limit{" "}
            <span className="font-bold">{values.description.length}</span>/500
          </div>
          {touched.description && errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Category Icon
          </label>
          <div className="grid grid-cols-6 gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFieldValue("icon", option.value)}
                className={`p-2 rounded-lg border text-center text-sm hover:bg-gray-50 transition-colors ${
                  values.icon === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                disabled={isLoading}
                title={option.label}
              >
                <div className="text-lg">{option.icon}</div>
              </button>
            ))}
          </div>
          {touched.icon && errors.icon && (
            <p className="text-xs text-red-600 mt-1">{errors.icon}</p>
          )}
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Category Color <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFieldValue("color", color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  values.color === color
                    ? "border-gray-800 scale-110"
                    : "border-gray-300 hover:scale-105"
                } transition-transform`}
                style={{ backgroundColor: color }}
                disabled={isLoading}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-500" />
            <Input
              name="color"
              placeholder="#3B82F6"
              value={values.color}
              onChange={handleChange}
              onBlur={handleBlur}
              className="flex-1 h-8 text-sm"
              disabled={isLoading}
            />
            <div
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: values.color }}
            />
          </div>
          {touched.color && errors.color && (
            <p className="text-xs text-red-600 mt-1">{errors.color}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 font-medium hover:bg-blue-700 transition"
          >
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900 px-6 py-2 font-medium"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}