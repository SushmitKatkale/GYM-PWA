import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Book } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I sign up for a gym membership?',
    answer: 'You can sign up for a membership by visiting any of our gym locations, using our mobile app, or through our website. Simply choose your preferred plan, provide your personal information, and complete the payment process.',
    category: 'Membership'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and cash payments at our physical locations. Auto-pay options are available for monthly and yearly subscriptions.',
    category: 'Payment'
  },
  {
    id: '3',
    question: 'Can I freeze or cancel my membership?',
    answer: 'Yes, you can freeze your membership for up to 3 months per year or cancel with 30 days notice. Freezing is available for medical reasons, travel, or other circumstances. Contact our support team to process these requests.',
    category: 'Membership'
  },
  {
    id: '4',
    question: 'How do I use the QR code check-in?',
    answer: 'Open the app, go to "QR Check-in" from the menu, and scan the QR code at the gym entrance. The system will automatically log your visit and update your attendance record.',
    category: 'App Usage'
  },
  {
    id: '5',
    question: 'What should I do if I forgot my login credentials?',
    answer: 'Click "Forgot Password" on the login screen and enter your email address. You\'ll receive a reset link within a few minutes. If you forgot your email, contact our support team with your membership details.',
    category: 'Account'
  },
  {
    id: '6',
    question: 'Are there any age restrictions?',
    answer: 'Members must be at least 16 years old. Those aged 16-17 require parental consent and supervision during their first few visits. We offer special youth programs for younger fitness enthusiasts.',
    category: 'Membership'
  },
  {
    id: '7',
    question: 'What equipment is available at the gyms?',
    answer: 'Our gyms feature cardio machines, free weights, resistance machines, functional training areas, and group class studios. Specific equipment varies by location - check individual gym pages for detailed amenity lists.',
    category: 'Facilities'
  },
  {
    id: '8',
    question: 'How do I book group classes?',
    answer: 'Group classes can be booked through the app under "My Schedule" or at the gym reception. Most classes can be booked up to 7 days in advance. Some popular classes may have waiting lists.',
    category: 'Classes'
  },
  {
    id: '9',
    question: 'Is there a mobile app available?',
    answer: 'Yes! Our mobile app is available for both iOS and Android devices. It includes features like QR check-in, class booking, workout tracking, and membership management.',
    category: 'App Usage'
  },
  {
    id: '10',
    question: 'What are your operating hours?',
    answer: 'Operating hours vary by location. Most gyms are open from 5:00 AM to 11:00 PM on weekdays, with slightly reduced weekend hours. Check the specific gym location page for exact hours.',
    category: 'General'
  }
];

const categories = ['All', 'Membership', 'Payment', 'App Usage', 'Account', 'Facilities', 'Classes', 'General'];

export function HelpFaq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFAQs.map(faq => (
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

      {filteredFAQs.length === 0 && (
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
