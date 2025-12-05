'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';

const POPULAR_SEARCHES = [
  'JavaScript',
  'Python',
  'React',
  'Machine Learning',
  'Web Development',
  'Data Science',
  'Cloud Computing',
  'Cybersecurity',
];

const CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
];

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onCategorySelect?: (category: string) => void;
}

export default function SearchSuggestions({
  value,
  onChange,
  onCategorySelect,
}: SearchSuggestionsProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  console.log(onCategorySelect);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches', e);
      }
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const searchLower = value.toLowerCase();

    // Filter popular searches and categories
    const matchedSearches = POPULAR_SEARCHES.filter((term) =>
      term.toLowerCase().includes(searchLower)
    );

    const matchedCategories = CATEGORIES.filter((cat) =>
      cat.label.toLowerCase().includes(searchLower)
    ).map((cat) => cat.label);

    // Combine and limit to 5 suggestions
    const combined = [...new Set([...matchedSearches, ...matchedCategories])].slice(0, 5);
    setSuggestions(combined);
  }, [value]);

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;

    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    saveRecentSearch(suggestion);
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      saveRecentSearch(value);
      setIsFocused(false);
    }
  };

  const showSuggestions = isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder="Search courses by title, topic, or skill..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !value && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-md transition flex items-center gap-3 text-gray-700"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {!value && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Popular Searches
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 rounded-md transition flex items-center gap-3 text-gray-700"
                >
                  <Search className="w-4 h-4 text-blue-500" />
                  <span className="flex-1">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {value && suggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No suggestions found. Press Enter to search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
