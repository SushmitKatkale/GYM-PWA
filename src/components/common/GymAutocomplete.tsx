import React, { useState, useEffect, useRef } from 'react';
import { Search, Building, ChevronDown, Check } from 'lucide-react';
import { adminPaymentService } from '../../services/adminPaymentService';

interface Gym {
  id: number;
  name: string;
  address: string;
  ownerEmail: string;
  city?: string;
}

interface GymAutocompleteProps {
  value: string | number;
  onChange: (gymId: number, gym?: Gym) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const GymAutocomplete: React.FC<GymAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for gym by name or address",
  disabled = false,
  required = false,
  className = ""
}) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchGyms = async (query: string) => {
    if (query.length < 2) {
      setFilteredGyms([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminPaymentService.searchGyms(query);
      if (response.success && response.data) {
        setFilteredGyms(response.data);
      } else {
        setFilteredGyms([]);
      }
    } catch (error) {
      console.error('Failed to search gyms:', error);
      setFilteredGyms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update selected gym when value changes
  useEffect(() => {
    if (value) {
      const gym = filteredGyms.find(g => g.id === value);
      setSelectedGym(gym || null);
      if (gym) {
        setSearchQuery(gym.name);
      }
    } else {
      setSelectedGym(null);
      setSearchQuery('');
    }
  }, [value, filteredGyms]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search query to selected gym display if no selection made
        if (selectedGym) {
          setSearchQuery(selectedGym.name);
        } else {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedGym]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (selectedGym && query !== selectedGym.name) {
      setSelectedGym(null);
      onChange(0);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchGyms(query);
    }, 300);
  };

  const handleGymSelect = (gym: Gym) => {
    setSelectedGym(gym);
    setSearchQuery(gym.name);
    setIsOpen(false);
    onChange(gym.id, gym);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Clear search query to show all options
    if (selectedGym) {
      setSearchQuery('');
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={isLoading ? 'Searching gyms...' : placeholder}
          disabled={disabled || isLoading}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        {selectedGym && (
          <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Searching gyms...
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              {searchQuery ? 'No gyms found matching your search' : 'Type to search for gyms'}
            </div>
          ) : (
            filteredGyms.map((gym) => (
              <div
                key={gym.id}
                onClick={() => handleGymSelect(gym)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  selectedGym?.id === gym.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {gym.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{gym.name}</div>
                    <div className="text-xs text-gray-500 truncate">{gym.address}</div>
                    <div className="text-xs text-gray-400">Owner: {gym.ownerEmail}</div>
                  </div>
                  {selectedGym?.id === gym.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500">
        {isLoading 
          ? 'Searching available gyms...' 
          : `${filteredGyms.length} gyms found`
        }
      </div>
      
      {filteredGyms.length === 0 && !isLoading && searchQuery.length >= 2 && (
        <div className="mt-1 text-xs text-red-500">
          No gyms found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default GymAutocomplete;
