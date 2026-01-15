import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/store/api/questionBankApi";

interface SectionSelectorProps {
  sections: Section[];
  value: string | null;
  onChange: (sectionId: string, sectionName: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}

export default function SectionSelector({
  sections,
  value,
  onChange,
  onCreateNew,
  disabled = false,
}: SectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSection = sections.find((section) => section._id === value);
  const displayText = selectedSection?.name || "General";

  const handleSelect = (sectionId: string, sectionName: string) => {
    onChange(sectionId, sectionName);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Section</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={disabled ? "text-gray-500" : "text-gray-900"}>
              {displayText}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {sections.map((section) => (
                <button
                  key={section._id}
                  type="button"
                  onClick={() => handleSelect(section._id, section.name)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    value === section._id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  {section.name}
                </button>
              ))}

              {/* Separator */}
              {sections.length > 0 && (
                <div className="border-t border-gray-200 my-1" />
              )}

              {/* Add New Option */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
              >
                Not found in list?{" "}
                <span className="text-blue-600 font-medium">+ Add New</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
