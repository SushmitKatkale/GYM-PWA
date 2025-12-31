import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, Phone, Mail, Book, 
  ArrowLeft, ChevronRight, Search, ExternalLink,
  Clock, CheckCircle, Star, ThumbsUp, Send
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerSupportMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerSupportMobile({ onBack, onNavigate }: OwnerSupportMobileProps) {
  const { user } = useAuthStore();
  
  const [activeSection, setActiveSection] = useState<'main' | 'faq' | 'contact' | 'guides'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  // Mock FAQ data
  const faqData = [
    {
      id: 1,
      category: 'payments',
      question: 'How do I set up automatic payouts?',
      answer: 'You can enable automatic payouts in your Wallet settings. Go to Settings > Business Settings > Payout Settings and toggle on "Auto Payouts".',
      helpful: 15,
      views: 120
    },
    {
      id: 2,
      category: 'gym-management',
      question: 'How do I add a new gym to my account?',
      answer: 'To add a new gym, go to the My Gyms section and tap the + button. Fill in all the required information including gym name, location, and operating hours.',
      helpful: 23,
      views: 89
    },
    {
      id: 3,
      category: 'members',
      question: 'Can I track member attendance in real-time?',
      answer: 'Yes, you can view real-time attendance data in the Check-in section. You\'ll see live updates when members scan QR codes to check in or out.',
      helpful: 18,
      views: 156
    },
    {
      id: 4,
      category: 'payments',
      question: 'What is the platform commission rate?',
      answer: 'The platform charges a 15% commission on all transactions. This covers payment processing, platform maintenance, and customer support.',
      helpful: 31,
      views: 203
    },
    {
      id: 5,
      category: 'trainers',
      question: 'How do I manage trainer schedules?',
      answer: 'Go to the Trainers section, select a trainer, and tap "View Schedule". You can add, edit, or remove time slots for each trainer.',
      helpful: 12,
      views: 67
    }
  ];

  // Mock guides data
  const guidesData = [
    {
      id: 1,
      title: 'Getting Started as a Gym Owner',
      description: 'Complete guide to setting up your first gym',
      duration: '10 min read',
      category: 'Setup',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Maximizing Revenue with Pricing Strategies',
      description: 'Best practices for subscription pricing',
      duration: '15 min read',
      category: 'Business',
      rating: 4.6
    },
    {
      id: 3,
      title: 'Managing Members and Trainers',
      description: 'Tips for effective team management',
      duration: '12 min read',
      category: 'Management',
      rating: 4.7
    },
    {
      id: 4,
      title: 'Understanding Analytics and Reports',
      description: 'How to read and use your dashboard data',
      duration: '8 min read',
      category: 'Analytics',
      rating: 4.5
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'payments', label: 'Payments' },
    { id: 'gym-management', label: 'Gym Management' },
    { id: 'members', label: 'Members' },
    { id: 'trainers', label: 'Trainers' },
    { id: 'technical', label: 'Technical' }
  ];

  const filteredFAQ = (faqData || []).filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = async () => {
    try {
      clearDevErrors();
      // Handle contact form submission - would be API call in production
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Your message has been sent! We\'ll get back to you within 24 hours.');
      setContactForm({ subject: '', message: '', priority: 'medium' });
    } catch (err) {
      const apiError = createApiError('/api/support/contact', 'POST', err);
      addDevError(apiError);
    }
  };

  // FAQ Section
  if (activeSection === 'faq') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Frequently Asked Questions</h1>
              <p className="text-sm text-gray-500">Find answers to common questions</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {(filteredFAQ || []).length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h3>
              <p className="text-gray-500">Try searching with different keywords or browse all topics.</p>
            </div>
          ) : (
            filteredFAQ.map((faq) => (
              <div key={faq.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{faq.views} views</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{faq.helpful} helpful</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {faq.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Guides Section
  if (activeSection === 'guides') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Guides & Tutorials</h1>
              <p className="text-sm text-gray-500">Learn how to make the most of your gym</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {(guidesData || []).map((guide) => (
            <div key={guide.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{guide.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{guide.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{guide.rating}</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {guide.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Contact Section
  if (activeSection === 'contact') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Contact Support</h1>
              <p className="text-sm text-gray-500">Get help from our support team</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Contact Options */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Quick Contact</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Call Support</p>
                    <p className="text-sm text-gray-500">Available 9 AM - 6 PM</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-500">Get instant help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-500">support@fitlife.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Send us a Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({...prev, subject: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm(prev => ({...prev, priority: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Need assistance</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              
              <button
                onClick={handleContactSubmit}
                disabled={!contactForm.subject || !contactForm.message}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </div>
          </div>

          {/* Response Time Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Expected Response Time</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Live Chat: Immediate</li>
                  <li>• Phone Support: Within 5 minutes</li>
                  <li>• Email: Within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Support Menu
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">Support</h1>
            <p className="text-sm text-gray-500">Get help when you need it</p>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="p-4 space-y-4">
        {/* Quick Help */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Quick Help</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setActiveSection('faq')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">FAQ</p>
                  <p className="text-sm text-gray-500">Frequently asked questions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setActiveSection('guides')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Book className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Guides & Tutorials</p>
                  <p className="text-sm text-gray-500">Step-by-step instructions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Contact Support</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setActiveSection('contact')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Get in Touch</p>
                  <p className="text-sm text-gray-500">Chat, call, or email us</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Popular Topics</h3>
          
          <div className="space-y-3">
            {faqData.slice(0, 3).map((faq) => (
              <button
                key={faq.id}
                onClick={() => setActiveSection('faq')}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <p className="font-medium text-gray-900 text-sm mb-1">{faq.question}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{faq.views} views</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{faq.helpful} helpful</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setActiveSection('faq')}
            className="w-full mt-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm"
          >
            View All FAQs
          </button>
        </div>

        {/* Status */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">All Systems Operational</h4>
              <p className="text-sm text-green-800">No reported issues at this time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}