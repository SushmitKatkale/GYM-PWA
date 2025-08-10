// Mock API responses for development when backend is not available
import { Advertisement, AdvertisementStats, PaginatedAdvertisements } from '../models/Advertisement';
import { Notification, CreateNotificationRequest, NotificationResponse } from '../services/notificationService';

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Gym Management System',
    message: 'Your account has been created successfully. Start exploring the features!',
    type: 'success',
    category: 'system',
    priority: 'normal',
    isRead: false,
    isGlobal: true,
    deliveryChannels: ['push'],
    createTimestamp: '2025-01-01T10:00:00.000Z',
    updateTimestamp: '2025-01-01T10:00:00.000Z',
    tags: ['welcome', 'onboarding']
  },
  {
    id: 'notif-2',
    title: 'Payment Due Reminder',
    message: 'Your membership payment is due in 3 days. Please complete your payment to continue enjoying our services.',
    type: 'reminder',
    category: 'payment',
    priority: 'high',
    isRead: false,
    isGlobal: false,
    recipientEmail: 'user@example.com',
    actionUrl: '/payments',
    actionText: 'Pay Now',
    deliveryChannels: ['push', 'email'],
    expiresAt: '2025-01-20T00:00:00.000Z',
    createTimestamp: '2025-01-05T09:00:00.000Z',
    updateTimestamp: '2025-01-05T09:00:00.000Z',
    tags: ['payment', 'reminder']
  }
];

// Mock data for development
export const mockAdvertisements: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Summer Fitness Special',
    description: 'Get fit this summer with our exclusive membership deals!',
    content: 'Join now and get 50% off your first month plus a free personal training session.',
    adType: 'banner',
    status: 'active',
    targetAudience: 'all',
    priority: 8,
    startDate: '2025-06-01T00:00:00.000Z',
    endDate: '2025-08-31T23:59:59.000Z',
    budget: 5000,
    clicks: 245,
    impressions: 12500,
    createTimestamp: '2025-01-01T00:00:00.000Z',
    updateTimestamp: '2025-01-05T10:30:00.000Z',
    media: [
      {
        id: 'media1',
        advertisementId: 'ad1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        mediaAltText: 'Summer fitness banner',
        mediaOrder: 1,
        createTimestamp: '2025-01-01T00:00:00.000Z'
      }
    ]
  },
  {
    id: 'ad2',
    title: 'New Year Yoga Challenge',
    description: 'Start the year right with our 30-day yoga challenge',
    content: 'Transform your body and mind with our comprehensive yoga program.',
    adType: 'card',
    status: 'active',
    targetAudience: 'members',
    priority: 6,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-31T23:59:59.000Z',
    budget: 2500,
    clicks: 89,
    impressions: 4500,
    createTimestamp: '2024-12-15T00:00:00.000Z',
    updateTimestamp: '2024-12-20T14:15:00.000Z',
    media: []
  },
  {
    id: 'ad3',
    title: 'Personal Training Promotion',
    description: 'Book a personal trainer and reach your goals faster',
    content: 'Our certified trainers will help you achieve your fitness goals with personalized workout plans.',
    adType: 'popup',
    status: 'inactive',
    targetAudience: 'gym_owners',
    priority: 5,
    startDate: '2025-02-01T00:00:00.000Z',
    endDate: '2025-02-28T23:59:59.000Z',
    budget: 1500,
    clicks: 12,
    impressions: 850,
    createTimestamp: '2024-12-01T00:00:00.000Z',
    media: []
  }
];

export const mockStats: AdvertisementStats = {
  totalAds: mockAdvertisements.length,
  activeAds: mockAdvertisements.filter(ad => ad.status === 'active').length,
  inactiveAds: mockAdvertisements.filter(ad => ad.status === 'inactive').length,
  draftAds: mockAdvertisements.filter(ad => ad.status === 'draft').length,
  expiredAds: mockAdvertisements.filter(ad => ad.status === 'expired').length,
  totalClicks: mockAdvertisements.reduce((sum, ad) => sum + ad.clicks, 0),
  totalImpressions: mockAdvertisements.reduce((sum, ad) => sum + ad.impressions, 0),
  averageCTR: 2.1,
  totalBudget: mockAdvertisements.reduce((sum, ad) => sum + (ad.budget || 0), 0),
  topPerformingAds: [
    {
      id: 'ad1',
      title: 'Summer Fitness Special',
      clicks: 245,
      impressions: 12500,
      ctr: 1.96
    },
    {
      id: 'ad2', 
      title: 'New Year Yoga Challenge',
      clicks: 89,
      impressions: 4500,
      ctr: 1.98
    }
  ]
};

export const mockPaginatedResponse: PaginatedAdvertisements = {
  advertisements: mockAdvertisements,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: mockAdvertisements.length,
    limit: 10
  },
  stats: mockStats
};

// Helper function to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API helper functions
export const mockApiHelpers = {
  getAdvertisements: async () => {
    await delay();
    return {
      success: true,
      data: mockPaginatedResponse,
      message: 'Mock data loaded successfully'
    };
  },
  
  getStats: async () => {
    await delay();
    return {
      success: true,
      data: mockStats,
      message: 'Mock stats loaded successfully'
    };
  },

  createAdvertisement: async (data: any) => {
    await delay();
    const newAd: Advertisement = {
      id: `ad${Date.now()}`,
      title: data.title,
      description: data.description || '',
      content: data.content || '',
      adType: data.adType,
      status: 'draft',
      targetAudience: data.targetAudience,
      priority: data.priority || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      clicks: 0,
      impressions: 0,
      createTimestamp: new Date().toISOString(),
      media: []
    };
    
    mockAdvertisements.unshift(newAd);
    
    return {
      success: true,
      data: newAd,
      message: 'Advertisement created successfully'
    };
  },

  updateAdvertisement: async (id: string, data: any) => {
    await delay();
    const adIndex = mockAdvertisements.findIndex(ad => ad.id === id);
    
    if (adIndex !== -1) {
      const updatedAd = {
        ...mockAdvertisements[adIndex],
        ...data,
        updateTimestamp: new Date().toISOString()
      };
      mockAdvertisements[adIndex] = updatedAd;
      
      return {
        success: true,
        data: updatedAd,
        message: 'Advertisement updated successfully'
      };
    }
    
    return {
      success: false,
      message: 'Advertisement not found'
    };
  }
};
