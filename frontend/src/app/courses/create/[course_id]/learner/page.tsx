import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { Button } from "@/components/ui/button";

export default function Learners() {
  return (
    <div className="bg-white p-6">
      {/* Top cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Learner", value: 0, icon: "👤" },
          { label: "Yet to start", value: 0, icon: "⏱️" },
          { label: "In Progress", value: 0, icon: "⏳" },
          { label: "Completed", value: 0, icon: "✅" },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center"
          >
            <div className="text-gray-500 flex items-center justify-center gap-2">
              <span>{card.icon}</span>
              {card.label}
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border rounded px-3 py-2 w-64"
        />
        <Button className="bg-blue-600 text-white">Add Learner</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">SL</th>
              <th className="py-2 px-4 text-left">Learner</th>
              <th className="py-2 px-4 text-left">Email Address</th>
              <th className="py-2 px-4 text-left">Enroll Date</th>
              <th className="py-2 px-4 text-left">Time Spent</th>
              <th className="py-2 px-4 text-left">Completed Date</th>
              <th className="py-2 px-4 text-left">Completion %</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
        </table>

        {/* Empty state */}

        <EmptyStateWithCreate
          message="Course is not published yet"
          description="Learners who enroll in this course will be listed here."
          buttonText="Create Now"
        />
      </div>
    </div>
  );
}
