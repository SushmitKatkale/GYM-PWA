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
    primary: '#FF7A00',
    secondary: '#12171F',  
    accent: '#3B4352',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    gradients: {
      primary: 'from-orange-500 to-orange-600',
      secondary: 'from-slate-800 to-slate-900',
      accent: 'from-slate-500 to-slate-600',
      admin: 'from-fuchsia-500 to-pink-500',
      owner: 'from-orange-500 to-amber-600',
      user: 'from-emerald-500 to-teal-600'
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
