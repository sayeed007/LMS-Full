// components/question-bank/QuestionBankSettingsPopup.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/Switch";
import { useEffect, useState } from "react";
import { CustomSelect } from "../ui/CustomSelect";
import PrimaryActionButton from "../ui/PrimaryButton";

export interface SettingsData {
  passingScoreRequired: boolean;
  passingScore: number;
  quizAttemptTime: string;
  quizTimeHours: number;
  quizTimeMinutes: number;
}

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsData) => void;
  initialSettings?: Partial<SettingsData>;
}

const quizAttemptOptions = [
  { value: "unlimited", label: "Unlimited" },
  { value: "1", label: "1 time" },
  { value: "2", label: "2 times" },
  { value: "3", label: "3 times" },
  { value: "5", label: "5 times" },
];

export function SettingsPopup({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: SettingsPopupProps) {
  // Form state - Initialize with defaults or provided settings
  const [passingScoreRequired, setPassingScoreRequired] = useState(
    initialSettings?.passingScoreRequired ?? true
  );
  const [passingScore, setPassingScore] = useState(
    initialSettings?.passingScore ?? 0
  );
  const [quizAttemptTime, setQuizAttemptTime] = useState(
    initialSettings?.quizAttemptTime ?? "unlimited"
  );
  const [quizTimeHours, setQuizTimeHours] = useState(
    initialSettings?.quizTimeHours ?? 0
  );
  const [quizTimeMinutes, setQuizTimeMinutes] = useState(
    initialSettings?.quizTimeMinutes ?? 0
  );

  // Update state when initialSettings changes (e.g. data fetched)
  useEffect(() => {
    if (initialSettings) {
      setPassingScoreRequired(initialSettings.passingScoreRequired ?? true);
      setPassingScore(initialSettings.passingScore ?? 0);
      setQuizAttemptTime(initialSettings.quizAttemptTime ?? "unlimited");
      setQuizTimeHours(initialSettings.quizTimeHours ?? 0);
      setQuizTimeMinutes(initialSettings.quizTimeMinutes ?? 0);
    }
  }, [initialSettings, isOpen]);

  const handleSave = () => {
    onSave({
      passingScoreRequired,
      passingScore,
      quizAttemptTime,
      quizTimeHours,
      quizTimeMinutes,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Question Bank Settings</SheetTitle>
          <SheetDescription>
            Configure global settings for this question bank. These settings
            will apply to all sections.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-8 py-8">
          {/* Passing Score Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Scoring Settings
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Passing Score Required
                </Label>
                <p className="text-sm text-gray-500">
                  Students must achieve a minimum score to pass.
                </p>
              </div>
              <Switch
                checked={passingScoreRequired}
                onChange={setPassingScoreRequired}
              />
            </div>

            {passingScoreRequired && (
              <div className="grid gap-2 p-4 bg-white border border-gray-200 rounded-lg">
                <Label>Minimum Passing Score (%)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) =>
                      setPassingScore(parseInt(e.target.value) || 0)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center font-semibold"
                  />
                  <span className="text-gray-500 font-medium">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Time & Attempts Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Attempts & Timing
            </h3>

            <div className="space-y-3">
              <Label>Allowed Attempts</Label>
              <CustomSelect
                options={quizAttemptOptions}
                value={quizAttemptTime}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setQuizAttemptTime(selectedOption);
                  }
                }}
                placeholder="Select attempt limit"
              />
              <p className="text-xs text-gray-500">
                Number of times a student can take quizzes in this question
                bank.
              </p>
            </div>

            <div className="grid gap-4 pt-2">
              <Label>Time Limit (Duration)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Hours</Label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={quizTimeHours}
                    onChange={(e) =>
                      setQuizTimeHours(parseInt(e.target.value) || 0)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Minutes</Label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={quizTimeMinutes}
                    onChange={(e) =>
                      setQuizTimeMinutes(parseInt(e.target.value) || 0)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Set to 0 hours and 0 minutes for unlimited time.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <PrimaryActionButton onClick={handleSave}>
              Save Changes
            </PrimaryActionButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
