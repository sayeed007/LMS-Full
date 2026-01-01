'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, DollarSign, Star, TrendingUp, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import SearchSuggestions from './SearchSuggestions';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { COURSE_LEVELS, SORT_OPTIONS, RATING_OPTIONS } from '@/constants/course';
import { EnhancedSelect } from '@/components/ui/SearchableSelect';

export interface CourseFiltersType {
  search: string;
  category: string;
  level: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: string;
}

interface CourseFiltersModalProps {
  initialFilters: CourseFiltersType;
  onApply: (filters: CourseFiltersType) => void;
  onClose: () => void;
}

export default function CourseFiltersModal({
  initialFilters,
  onApply,
  onClose,
}: CourseFiltersModalProps) {
  const [filters, setFilters] = useState<CourseFiltersType>(initialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseFloat(initialFilters.minPrice) || 0,
    parseFloat(initialFilters.maxPrice) || 1000
  ]);

  // Fetch categories from backend
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({
    isActive: true,
    limit: 100
  });

  // Memoize category options
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data
      .filter(cat => cat.isActive)
      .map(cat => ({
        value: cat.name,
        label: cat.name
      }));
  }, [categoriesData]);

  // Shared slider thumb styles
  const sliderThumbStyles = "absolute w-full appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform";

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseFloat(e.target.value) || 0;
    const newRange: [number, number] = type === 'min'
      ? [value, priceRange[1]]
      : [priceRange[0], value];
    setPriceRange(newRange);
    setFilters((prev) => ({
      ...prev,
      minPrice: newRange[0].toString(),
      maxPrice: newRange[1].toString()
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      level: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
    };
    setFilters(clearedFilters);
    setPriceRange([0, 1000]);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.level ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Filter Courses</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-clip px-6 py-6 space-y-6">
        {/* Search Bar with Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Courses
          </label>
          <SearchSuggestions
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            onCategorySelect={(category) => handleFilterChange('category', category)}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Sort By
          </label>
          <EnhancedSelect
            value={filters.sort}
            onValueChange={(value) => value && handleFilterChange('sort', value)}
            placeholder="Select sort option"
            clearable={false}
            options={SORT_OPTIONS.map(option => ({
              value: option.value,
              label: option.label
            }))}
            className="w-full"
          />
        </div>

        {/* Category and Difficulty Level - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <EnhancedSelect
              value={filters.category || undefined}
              onValueChange={(value) => handleFilterChange('category', value || '')}
              placeholder="All Categories"
              clearable={true}
              disabled={categoriesLoading}
              options={categoryOptions}
              className="w-full"
              size="sm"
            />
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <EnhancedSelect
              value={filters.level || undefined}
              onValueChange={(value) => handleFilterChange('level', value || '')}
              placeholder="All Levels"
              clearable={true}
              options={COURSE_LEVELS.map(level => ({
                value: level.value,
                label: level.label
              }))}
              className="w-full"
              size="sm"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Price Range
            </label>
            <span className="text-sm font-semibold text-blue-600">
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>

          <div className="space-y-5">
            {/* Dual-handle range slider */}
            <div className="relative pt-2 pb-8 px-1">
              {/* Track background */}
              <div className="absolute w-full h-1.5 bg-gray-200 rounded-full top-2"></div>

              {/* Active track between handles */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full top-2 transition-all"
                style={{
                  left: `${(priceRange[0] / 1000) * 100}%`,
                  right: `${100 - (priceRange[1] / 1000) * 100}%`
                }}
              ></div>

              {/* Min handle */}
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), priceRange[1] - 10);
                  const syntheticEvent = {
                    ...e,
                    target: { ...e.target, value: String(value) }
                  } as React.ChangeEvent<HTMLInputElement>;
                  handlePriceRangeChange(syntheticEvent, 'min');
                }}
                className={sliderThumbStyles}
                style={{ zIndex: priceRange[0] > 1000 - 100 ? 5 : 3 }}
              />

              {/* Max handle */}
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Math.max(Number(e.target.value), priceRange[0] + 10);
                  const syntheticEvent = {
                    ...e,
                    target: { ...e.target, value: String(value) }
                  } as React.ChangeEvent<HTMLInputElement>;
                  handlePriceRangeChange(syntheticEvent, 'max');
                }}
                className={sliderThumbStyles}
                style={{ zIndex: priceRange[1] < 100 ? 5 : 4 }}
              />

              {/* Value labels below handles */}
              <div className="absolute w-full top-6">
                <div
                  className="absolute -translate-x-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded shadow-sm"
                  style={{ left: `${(priceRange[0] / 1000) * 100}%` }}
                >
                  ${priceRange[0]}
                </div>
                <div
                  className="absolute -translate-x-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded shadow-sm"
                  style={{ left: `${(priceRange[1] / 1000) * 100}%` }}
                >
                  ${priceRange[1]}
                </div>
              </div>
            </div>

            {/* Number inputs for precise control */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Min Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e, 'min')}
                    placeholder="0"
                    min="0"
                    max="1000"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Max Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(e, 'max')}
                    placeholder="1000"
                    min="0"
                    max="1000"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Star className="w-4 h-4 inline mr-1 fill-current" />
            Minimum Rating
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={filters.minRating === option.value}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <div className="flex items-center gap-1 flex-wrap">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(parseFloat(option.value))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
          {filters.minRating && (
            <button
              onClick={() => handleFilterChange('minRating', '')}
              className="text-sm text-blue-600 hover:text-blue-700 mt-3"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex gap-3">
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="flex-1 py-2.5 font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="flex-1 bg-info text-white py-2.5 font-medium hover:bg-info/90 transition"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
