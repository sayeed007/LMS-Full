// app/reports/individual-learner/page.tsx
"use client";
import { GoBackRoute } from "@/components/reports/GoBackRoute";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useGetLearnersListQuery } from "@/store/api/reportApi";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function IndividualLearnerReport() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id as string;
  const [selectedLearner, setSelectedLearner] = useState<string | null>(
    learnerId
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch learners list
  const { data, isLoading, error } = useGetLearnersListQuery(searchTerm);
  const learners = data?.data || [];

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load learners list");
    }
  }, [error]);

  useEffect(() => {
    if (selectedLearner) {
      router.push(`/reports/individual-learner/${selectedLearner}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLearner]);

  // Loading state
  if (isLoading && learners.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading learners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <GoBackRoute />
          <div className="relative">
            <CustomSelect
              options={learners}
              value={selectedLearner}
              onChange={setSelectedLearner}
              placeholder="Select a Learner"
            />
            {isLoading && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Individual Learner Report
        </h1>
        <div className="w-[140px]"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col w-full h-[60vh] justify-center items-center">
        {learners.length === 0 ? (
          <>
            <p className="text-gray-600 text-lg mb-4">No learners found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or contact your administrator
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-lg mb-4">
              Select a learner to view their report
            </p>
            <p className="text-gray-500 text-sm">
              Use the dropdown above to choose a learner
            </p>
          </>
        )}
      </div>
    </div>
  );
}
