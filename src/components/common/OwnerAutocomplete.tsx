import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown, Check } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../../config/api';

interface Owner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  activeStatus: string;
  type: string;
}

interface OwnerAutocompleteProps {
  value: string;
  onChange: (ownerId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const OwnerAutocomplete: React.FC<OwnerAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for owner by email or name",
  disabled = false,
  required = false,
  className = ""
}) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch owners on component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.OWNERS));
        const data = await response.json();
        if (data.success) {
          const activeOwners = data.data.filter((owner: Owner) => owner.activeStatus === '1');
          setOwners(activeOwners);
          setFilteredOwners(activeOwners);
        } else {
          console.error('API returned error:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch owners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwners();
  }, []);

  // Update selected owner when value changes
  useEffect(() => {
    if (value && owners.length > 0) {
      const owner = owners.find(o => o.email === value);
      setSelectedOwner(owner || null);
      if (owner) {
        setSearchQuery(`${owner.email} - ${owner.firstName} ${owner.lastName}`);
      }
    } else {
      setSelectedOwner(null);
      setSearchQuery('');
    }
  }, [value, owners]);

  // Filter owners based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter(owner =>
        owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOwners(filtered);
    }
  }, [searchQuery, owners]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search query to selected owner display if no selection made
        if (selectedOwner) {
          setSearchQuery(`${selectedOwner.email} - ${selectedOwner.firstName} ${selectedOwner.lastName}`);
        } else {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOwner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (selectedOwner && query !== `${selectedOwner.email} - ${selectedOwner.firstName} ${selectedOwner.lastName}`) {
      setSelectedOwner(null);
      onChange('');
    }
  };

  const handleOwnerSelect = (owner: Owner) => {
    setSelectedOwner(owner);
    setSearchQuery(`${owner.email} - ${owner.firstName} ${owner.lastName}`);
    setIsOpen(false);
    onChange(owner.email);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Clear search query to show all options
    if (selectedOwner) {
      setSearchQuery('');
    }
  };

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
          placeholder={isLoading ? 'Loading owners...' : placeholder}
          disabled={disabled || isLoading}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        {selectedOwner && (
          <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Loading owners...
            </div>
          ) : filteredOwners.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              {searchQuery ? 'No owners found matching your search' : 'No active owners available'}
            </div>
          ) : (
            filteredOwners.map((owner) => (
              <div
                key={owner.id}
                onClick={() => handleOwnerSelect(owner)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  selectedOwner?.id === owner.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {owner.firstName[0]}{owner.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{owner.firstName} {owner.lastName}</div>
                    <div className="text-xs text-gray-500 truncate">{owner.email}</div>
                    <div className="text-xs text-gray-400">@{owner.username}</div>
                  </div>
                  {selectedOwner?.id === owner.id && (
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
          ? 'Loading available owners...' 
          : `${owners.length} owners available`
        }
      </div>
      
      {owners.length === 0 && !isLoading && (
        <div className="mt-1 text-xs text-red-500">
          No active owners found. Please ensure there are registered gym owners.
        </div>
      )}
    </div>
  );
};

export default OwnerAutocomplete;
