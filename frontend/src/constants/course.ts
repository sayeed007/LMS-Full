// Course constants synced with backend
// Backend reference: backend/src/models/Course.js line 319

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const;

export const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 & up' },
  { value: '4', label: '4 & up' },
  { value: '3.5', label: '3.5 & up' },
  { value: '3', label: '3 & up' },
] as const;

// Type exports
export type CourseLevelValue = typeof COURSE_LEVELS[number]['value'];
export type SortOptionValue = typeof SORT_OPTIONS[number]['value'];
export type RatingOptionValue = typeof RATING_OPTIONS[number]['value'];
