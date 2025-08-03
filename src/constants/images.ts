// Image constants for the application

export const IMAGES = {
  // Profile avatars
  AVATARS: {
    MALE: '/images/profiles/avatar-male.svg',
    FEMALE: '/images/profiles/avatar-female.svg',
    DEFAULT: '/images/profiles/avatar-male.svg'
  },

  // Gym images
  GYMS: {
    GYM_1: '/images/gyms/gym-1.svg',
    GYM_2: '/images/gyms/gym-2.svg',
    GYM_3: '/images/gyms/gym-3.svg'
  },

  // Illustrations
  ILLUSTRATIONS: {
    WORKOUT: '/images/illustrations/workout.svg',
    EMPTY_STATE: '/images/illustrations/workout.svg'
  },

  // Logos
  LOGOS: {
    HORIZONTAL: '/images/logos/logo-horizontal.svg',
    APP_ICON: '/icons/app-icon.svg',
    FAVICON: '/favicon.svg'
  },

  // PWA Icons
  ICONS: {
    APP_192: '/icons/manifest-icon-192.maskable.png',
    APP_512: '/icons/manifest-icon-512.maskable2.png',
    APPLE_180: '/icons/apple-icon-180.png',
    APP_SVG: '/icons/app-icon.svg'
  }
};

// Utility functions for images
export const getAvatarImage = (gender?: string | null, avatar?: string | null): string => {
  if (avatar) return avatar;
  
  switch (gender?.toLowerCase()) {
    case 'female':
      return IMAGES.AVATARS.FEMALE;
    case 'male':
      return IMAGES.AVATARS.MALE;
    default:
      return IMAGES.AVATARS.DEFAULT;
  }
};

export const getGymImage = (gymId: string): string => {
  switch (gymId) {
    case 'gym1':
      return IMAGES.GYMS.GYM_1;
    case 'gym2':
      return IMAGES.GYMS.GYM_2;
    case 'gym3':
      return IMAGES.GYMS.GYM_3;
    default:
      return IMAGES.GYMS.GYM_1;
  }
};

export const getPlaceholderImage = (width: number = 400, height: number = 300, text: string = 'Image'): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#E5E7EB"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#6B7280">${text}</text>
    </svg>
  `)}`;
};
