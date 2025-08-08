import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export interface AutocompleteOption {
  id: string | number;
  label: string;
  value: string | number;
  subtitle?: string;
}

interface AutocompleteProps {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number, option?: AutocompleteOption) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  options?: AutocompleteOption[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  debounceMs?: number;
  minSearchLength?: number;
  allowClear?: boolean;
}

export function Autocomplete({
  label,
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  options = [],
  loading = false,
  disabled = false,
  error,
  required = false,
  className = '',
  debounceMs = 300,
  minSearchLength = 1,
  allowClear = true
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Find selected option from value
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value) || 
                    searchResults.find(opt => opt.value === value);
      if (option) {
        setSelectedOption(option);
        setSearchQuery(value.toString());
      }
    } else {
      setSelectedOption(null);
      setSearchQuery('');
    }
  }, [value, options, searchResults]);

  // Debounced search
  const debouncedSearch = useCallback(async (query: string) => {
    if (query.length < minSearchLength) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, minSearchLength]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedOption(null);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(query);
    }, debounceMs);
  };

  // Handle option selection
  const handleSelectOption = (option: AutocompleteOption) => {
    setSelectedOption(option);
    setSearchQuery(option.label);
    setIsOpen(false);
    onChange(option.value, option);
  };

  // Handle clear
  const handleClear = () => {
    setSelectedOption(null);
    setSearchQuery('');
    setSearchResults([]);
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (searchQuery && !selectedOption) {
      debouncedSearch(searchQuery);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicking on options
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const displayOptions = searchQuery ? searchResults : options;
  const showLoading = loading || isSearching;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {selectedOption && allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {showLoading ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Searching...</span>
                </div>
              </div>
            ) : displayOptions.length > 0 ? (
              displayOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-sm text-gray-500">{option.subtitle}</div>
                  )}
                </button>
              ))
            ) : searchQuery.length >= minSearchLength ? (
              <div className="px-4 py-3 text-center text-gray-500">
                No results found
              </div>
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                Type to search...
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
