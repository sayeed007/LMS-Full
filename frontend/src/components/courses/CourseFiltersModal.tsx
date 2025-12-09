'use client';

import { BookOpen, DollarSign, Star, TrendingUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchSuggestions from './SearchSuggestions';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
  { value: 'devops', label: 'DevOps' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'business', label: 'Business' },
  { value: 'finance', label: 'Finance' },
  { value: 'management', label: 'Management' },
  { value: 'personal-development', label: 'Personal Development' },
  { value: 'health-fitness', label: 'Health & Fitness' },
  { value: 'language-learning', label: 'Language Learning' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'music', label: 'Music' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 & up' },
  { value: '4', label: '4 & up' },
  { value: '3.5', label: '3.5 & up' },
  { value: '3', label: '3 & up' },
];

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Filter Courses</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close filters"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">All Levels</option>
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="Min Price"
              min="0"
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="Max Price"
              min="0"
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Star className="w-4 h-4 inline mr-1 fill-current" />
            Minimum Rating
          </label>
          <div className="space-y-3">
            {RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={filters.minRating === option.value}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(parseFloat(option.value))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">{option.label}</span>
                </div>
              </label>
            ))}
            {filters.minRating && (
              <button
                onClick={() => handleFilterChange('minRating', '')}
                className="text-sm text-blue-600 hover:text-blue-700 ml-2"
              >
                Clear rating filter
              </button>
            )}
          </div>
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
