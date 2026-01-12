import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGetQuestionBanksQuery } from "@/store/api/questionBankApi";
import { useGetQuestionsByQuestionBankQuery } from "@/store/api/questionApi";
import { Loader2 } from "lucide-react";

interface PickQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questionIds: string[]) => void;
  currentQuestionBankId: string;
}

export function PickQuestionDialog({
  isOpen,
  onClose,
  onImport,
  currentQuestionBankId,
}: PickQuestionDialogProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    new Set()
  );

  // Fetch all question banks
  const { data: banksData, isLoading: isLoadingBanks } =
    useGetQuestionBanksQuery({ my: true });

  // Filter out current bank
  const availableBanks = useMemo(() => {
    return (
      banksData?.data?.questionBanks?.filter(
        (bank) => bank._id !== currentQuestionBankId
      ) || []
    );
  }, [banksData, currentQuestionBankId]);

  // Fetch questions for selected bank
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    isFetching: isFetchingQuestions,
  } = useGetQuestionsByQuestionBankQuery(
    { questionBankId: selectedBankId },
    { skip: !selectedBankId }
  );

  const questions = questionsData?.data?.questions || [];

  const handleBankChange = (value: string) => {
    setSelectedBankId(value);
    setSelectedQuestionIds(new Set()); // Reset selections
  };

  const toggleQuestion = (id: string) => {
    const newCtx = new Set(selectedQuestionIds);
    if (newCtx.has(id)) {
      newCtx.delete(id);
    } else {
      newCtx.add(id);
    }
    setSelectedQuestionIds(newCtx);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds(new Set(questions.map((q) => q._id)));
    } else {
      setSelectedQuestionIds(new Set());
    }
  };

  const handleConfirm = () => {
    if (selectedQuestionIds.size > 0) {
      onImport(Array.from(selectedQuestionIds));
      onClose();
      // Reset state
      setSelectedBankId("");
      setSelectedQuestionIds(new Set());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Questions from Question Bank</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Bank Selection */}
          <div className="space-y-2">
            <Label>Select Question Bank</Label>
            <Select
              value={selectedBankId}
              onValueChange={handleBankChange}
              disabled={isLoadingBanks}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a question bank..." />
              </SelectTrigger>
              <SelectContent>
                {availableBanks.map((bank) => (
                  <SelectItem key={bank._id} value={bank._id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Selection */}
          {selectedBankId && (
            <div className="flex-1 flex flex-col overflow-hidden border rounded-md p-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b">
                <Label className="text-sm font-medium">
                  Available Questions{" "}
                  {questions.length > 0 && `(${questions.length})`}
                </Label>
                {questions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedQuestionIds.size === questions.length &&
                        questions.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label
                      htmlFor="select-all"
                      className="text-xs cursor-pointer"
                    >
                      Select All
                    </Label>
                  </div>
                )}
              </div>

              {isLoadingQuestions || isFetchingQuestions ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : questions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No questions found in this bank.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-3 pr-4">
                    {questions.map((q) => (
                      <div
                        key={q._id}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          id={q._id}
                          checked={selectedQuestionIds.has(q._id)}
                          onCheckedChange={() => toggleQuestion(q._id)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={q._id}
                            className="text-sm font-medium leading-normal cursor-pointer text-gray-900"
                          >
                            <div
                              dangerouslySetInnerHTML={{ __html: q.text }}
                              className="line-clamp-2"
                            />
                          </Label>
                          <p className="text-xs text-gray-500">
                            Type: {q.type} | Difficulty: {q.difficulty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedQuestionIds.size === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Import Selected ({selectedQuestionIds.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
