// API Configuration
export const API_CONFIG = {
  BASE_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`,
  ENDPOINTS: {
    OWNERS: '/owners',
    USERS: '/users',
    GYMS: '/gyms',
    GYMS_PUBLIC: '/gyms/public/discover',
    SUBSCRIPTIONS: '/subscriptions',
    SUBSCRIPTION_FEATURES: '/subscription-features',
    AUTH: '/auth',
    AMENITIES: '/amenities',
    PAYMENTS: '/payments',
    INVOICES: '/invoices',
    SLOTS: '/slots',
    USER_SUBSCRIPTIONS: '/user-subscriptions',
    ADMIN: '/admin'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
