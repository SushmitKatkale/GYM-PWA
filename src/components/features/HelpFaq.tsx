import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Book, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data: {
    faqs: FAQItem[];
    total: number;
  };
  timestamp: string;
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: string[];
  };
  timestamp: string;
}

export function HelpFaq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch FAQs from API
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const url = buildApiUrl(`/faqs?${params}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse = await response.json();
      
      if (result.success) {
        setFaqs(result.data.faqs);
      } else {
        throw new Error(result.message || 'Failed to fetch FAQs');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const url = buildApiUrl('/faqs/categories');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: CategoriesResponse = await response.json();
      
      if (result.success) {
        setCategories(result.data.categories);
      } else {
        console.error('Failed to fetch categories:', result.message);
        // Keep default categories if API fails
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Keep default categories if API fails
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchFAQs();
  }, []);

  // Fetch FAQs when search term or category changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFAQs();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Show loading state
  if (loading && faqs.length === 0) {
    return (
      <div className="space-y-4 px-4 md:px-8 max-w-full mx-auto mt-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && faqs.length === 0) {
    return (
      <div className="space-y-4 px-4 md:px-8 max-w-full mx-auto mt-4">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load FAQs</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchFAQs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 md:px-8 max-w-full mx-auto mt-4">
      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for answers..."
            className="w-full pl-12 pr-2 py-2 text-lg border border-gray-300 rounded-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading indicator for search/filter */}
      {loading && faqs.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Updating results...</p>
        </div>
      )}

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-sm shadow-sm border border-gray-200">
            <button
              onClick={() => toggleExpanded(faq.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="text-sm text-blue-600 font-medium">{faq.category}</span>
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
              </div>
              {expandedItems.includes(faq.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedItems.includes(faq.id) && (
              <div className="px-6 pb-4">
                <div className="border-t border-gray-100 pt-1">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && faqs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Book className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse different categories
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600">Our support team is here to assist you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-sm p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
              Start Chat
            </button>
          </div>
          
          <div className="bg-white rounded-sm p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-4">Call us Mon-Fri, 9AM-6PM</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
              Call Now
            </button>
          </div>
          
          <div className="bg-white rounded-sm p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">We'll respond within 24 hours</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
