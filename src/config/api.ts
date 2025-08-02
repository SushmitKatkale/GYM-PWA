// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    OWNERS: '/owners',
    USERS: '/users',
    GYMS: '/gyms',
    SUBSCRIPTIONS: '/subscriptions',
    AUTH: '/auth'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
