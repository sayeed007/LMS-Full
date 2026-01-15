import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useGetQuestionBanksByCourseQuery } from "@/store/api/questionBankApi";

interface QuestionBankSelectorProps {
  courseId: string;
  value: string | null;
  onChange: (bankId: string, bankName: string) => void;
  onCreateNew: () => void;
}

export default function QuestionBankSelector({
  courseId,
  value,
  onChange,
  onCreateNew,
}: QuestionBankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useGetQuestionBanksByCourseQuery({ courseId });
  const questionBanks = data?.data?.questionBanks || [];

  const selectedBank = questionBanks.find((bank) => bank._id === value);
  const displayText = selectedBank?.name || "Course Quizzes (default)";

  const handleSelect = (bankId: string, bankName: string) => {
    onChange(bankId, bankName);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Question Bank
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-900">{displayText}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Loading...
                </div>
              ) : (
                <>
                  {questionBanks.map((bank) => (
                    <button
                      key={bank._id}
                      type="button"
                      onClick={() => handleSelect(bank._id, bank.name)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        value === bank._id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-900"
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}

                  {/* Separator */}
                  {questionBanks.length > 0 && (
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
