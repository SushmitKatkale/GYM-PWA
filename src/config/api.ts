// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_CONFIG = {
  BASE_URL: `${API_BASE_URL}/api`,
  ENDPOINTS: {
    OWNERS: '/owners',
    USERS: '/users',
    GYMS: '/gyms',
    GYMS_PUBLIC: '/gyms/public/discover',
    GYM_IMAGES: '/gym-images',
    SUBSCRIPTIONS: '/subscriptions',
    SUBSCRIPTION_FEATURES: '/subscription-features',
    AUTH: '/auth',
    AMENITIES: '/amenities',
    PAYMENTS: '/payments',
    INVOICES: '/invoices',
    SLOTS: '/slots',
    USER_SUBSCRIPTIONS: '/user-subscriptions',
    ADMIN: '/admin',
    ADVERTISEMENTS: '/advertisements',
    // Attendance system endpoints
    ATTENDANCE: '/attendance',
    QR_CODES: '/qr-codes',
    UNIQUE_CODES: '/unique-codes',
    CHECKIN_METHODS: '/checkin-methods',
    ATTENDANCE_ANALYTICS: '/attendance-analytics'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
