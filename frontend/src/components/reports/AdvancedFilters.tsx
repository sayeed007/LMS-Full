import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { EnhancedSelect } from '@/components/ui/SearchableSelect';

interface FilterOption {
  value: string;
  label: string;
}

interface AdvancedFiltersProps {
  // Category filter
  showCategoryFilter?: boolean;
  categories?: FilterOption[];
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;

  // Status filter
  showStatusFilter?: boolean;
  selectedStatus?: string | null;
  onStatusChange?: (status: string | null) => void;

  // Published filter
  showPublishedFilter?: boolean;
  selectedPublished?: boolean | null;
  onPublishedChange?: (published: boolean | null) => void;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'yet_to_start', label: 'Yet to Start' },
];

const PUBLISHED_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
];

export function AdvancedFilters({
  showCategoryFilter = false,
  categories = [],
  selectedCategory = null,
  onCategoryChange,
  showStatusFilter = false,
  selectedStatus = null,
  onStatusChange,
  showPublishedFilter = false,
  selectedPublished = null,
  onPublishedChange,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedStatus && selectedStatus !== 'all') ||
    (selectedPublished !== null);

  const handleClearAll = () => {
    if (onCategoryChange) onCategoryChange(null);
    if (onStatusChange) onStatusChange(null);
    if (onPublishedChange) onPublishedChange(null);
  };

  const handleCategoryChange = (value: string) => {
    if (onCategoryChange) {
      onCategoryChange(value === 'all' ? null : value);
    }
  };

  const handleStatusChange = (value: string) => {
    if (onStatusChange) {
      onStatusChange(value === 'all' ? null : value);
    }
  };

  const handlePublishedChange = (value: string) => {
    if (onPublishedChange) {
      if (value === 'all') {
        onPublishedChange(null);
      } else {
        onPublishedChange(value === 'published');
      }
    }
  };

  // If no filters are enabled, don't render anything
  if (!showCategoryFilter && !showStatusFilter && !showPublishedFilter) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Active
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
          <div className="absolute right-0 mt-2 w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Category Filter */}
                {showCategoryFilter && categories.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <EnhancedSelect
                      value={selectedCategory || undefined}
                      onValueChange={(value) => handleCategoryChange(value || 'all')}
                      placeholder="All Categories"
                      clearable={true}
                      options={categories}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                )}

                {/* Status Filter */}
                {showStatusFilter && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <EnhancedSelect
                      value={selectedStatus || undefined}
                      onValueChange={(value) => handleStatusChange(value || 'all')}
                      placeholder="All Statuses"
                      clearable={true}
                      options={STATUS_OPTIONS.filter(opt => opt.value !== 'all')}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                )}

                {/* Published Filter */}
                {showPublishedFilter && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Publication Status
                    </label>
                    <EnhancedSelect
                      value={
                        selectedPublished === null
                          ? undefined
                          : selectedPublished
                          ? 'published'
                          : 'unpublished'
                      }
                      onValueChange={(value) => handlePublishedChange(value || 'all')}
                      placeholder="All"
                      clearable={true}
                      options={PUBLISHED_OPTIONS.filter(opt => opt.value !== 'all')}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
