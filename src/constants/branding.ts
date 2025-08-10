// FItEspero Brand Constants
export const BRAND = {
  name: 'FItEspero',
  fullName: 'FItEspero - Fitness Management',
  tagline: 'Your Perfect Fitness Partner',
  shortTagline: 'Fitness Made Simple',
  description: 'Modern fitness management app that helps users discover gyms, track workouts, manage memberships, and stay motivated with tailored fitness plans.',
  logo: {
    // Using available icons from public/icons
    icon: '/icons/favicon.svg',
    iconPng192: '/icons/android-chrome-192x192.png',
    iconPng512: '/icons/android-chrome-512x512.png',
    appleTouchIcon: '/icons/apple-touch-icon.png',
    favicon: '/icons/favicon.ico'
  },
  colors: {
    primary: '#2563EB', // Blue
    secondary: '#10B981', // Green  
    accent: '#8B5CF6', // Purple
    error: '#EF4444', // Red
    warning: '#F59E0B', // Yellow
    success: '#10B981', // Green
    gradients: {
      primary: 'from-blue-600 to-blue-700',
      secondary: 'from-green-600 to-green-700',
      accent: 'from-purple-600 to-purple-700',
      admin: 'from-purple-600 to-pink-600',
      owner: 'from-blue-600 to-indigo-600',
      user: 'from-green-600 to-teal-600'
    }
  },
  social: {
    twitter: '@FItEspero',
    facebook: 'FItEspero',
    instagram: '@fitespero'
  }
} as const;

// Brand component props
export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'text' | 'full';
  className?: string;
  showTagline?: boolean;
}

// Size mappings for icons
export const LOGO_SIZES = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
} as const;

// Text size mappings
export const TEXT_SIZES = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
} as const;
