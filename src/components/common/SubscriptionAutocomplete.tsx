import React, { useState, useEffect, useRef } from 'react';
import { Search, CreditCard, ChevronDown, Check } from 'lucide-react';
import { adminPaymentService } from '../../services/adminPaymentService';

interface Subscription {
  id: number;
  title: string;
  price: string;
  gymName: string;
  gymId: number;
}

interface SubscriptionAutocompleteProps {
  value: string | number;
  onChange: (subscriptionId: number, subscription?: Subscription) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const SubscriptionAutocomplete: React.FC<SubscriptionAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for subscription by title or gym",
  disabled = false,
  required = false,
  className = ""
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchSubscriptions = async (query: string) => {
    if (query.length < 2) {
      setFilteredSubscriptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminPaymentService.searchSubscriptions(query);
      if (response.success && response.data) {
        setFilteredSubscriptions(response.data);
      } else {
        setFilteredSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to search subscriptions:', error);
      setFilteredSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update selected subscription when value changes
  useEffect(() => {
    if (value) {
      const subscription = filteredSubscriptions.find(s => s.id === value);
      setSelectedSubscription(subscription || null);
      if (subscription) {
        setSearchQuery(subscription.title);
      }
    } else {
      setSelectedSubscription(null);
      setSearchQuery('');
    }
  }, [value, filteredSubscriptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search query to selected subscription display if no selection made
        if (selectedSubscription) {
          setSearchQuery(selectedSubscription.title);
        } else {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedSubscription]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (selectedSubscription && query !== selectedSubscription.title) {
      setSelectedSubscription(null);
      onChange(0);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchSubscriptions(query);
    }, 300);
  };

  const handleSubscriptionSelect = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSearchQuery(subscription.title);
    setIsOpen(false);
    onChange(subscription.id, subscription);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Clear search query to show all options
    if (selectedSubscription) {
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
          placeholder={isLoading ? 'Searching subscriptions...' : placeholder}
          disabled={disabled || isLoading}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        {selectedSubscription && (
          <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Searching subscriptions...
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              {searchQuery ? 'No subscriptions found matching your search' : 'Type to search for subscriptions'}
            </div>
          ) : (
            filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                onClick={() => handleSubscriptionSelect(subscription)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  selectedSubscription?.id === subscription.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{subscription.title}</div>
                    <div className="text-xs text-gray-500 truncate">{subscription.gymName}</div>
                    <div className="text-xs text-gray-400">₹{subscription.price}</div>
                  </div>
                  {selectedSubscription?.id === subscription.id && (
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
          ? 'Searching available subscriptions...' 
          : `${filteredSubscriptions.length} subscriptions found`
        }
      </div>
      
      {filteredSubscriptions.length === 0 && !isLoading && searchQuery.length >= 2 && (
        <div className="mt-1 text-xs text-red-500">
          No subscriptions found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default SubscriptionAutocomplete;
