import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  label?: string;
}

const PREDEFINED_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'This year', days: 'year' as const },
  { label: 'All time', days: null },
];

export function DateRangeFilter({ onDateRangeChange, label = 'Date Range' }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = () => {
    onDateRangeChange(
      startDate || null,
      endDate || null
    );
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null, null);
  };

  const handlePredefinedRange = (days: number | 'year' | null) => {
    if (days === null) {
      // All time
      setStartDate('');
      setEndDate('');
      onDateRangeChange(null, null);
      return;
    }

    const end = new Date();
    const start = new Date();

    if (days === 'year') {
      // This year - from January 1st
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    } else {
      // Subtract days
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
    }

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    setStartDate(startDateStr);
    setEndDate(endDateStr);
    onDateRangeChange(startDateStr, endDateStr);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        {label}
        {(startDate || endDate) && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Filtered
          </span>
        )}
      </Button>

      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsExpanded(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Date Range</h3>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PREDEFINED_RANGES.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedRange(range.days)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Range */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleApply();
                    setIsExpanded(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
