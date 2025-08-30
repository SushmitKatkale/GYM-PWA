export type AdType = 'banner' | 'popup' | 'card' | 'video' | 'carousel';
export type AdStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type TargetAudience = 'all' | 'members' | 'gym_owners' | 'specific_gyms' | 'location_based';
export type MediaType = 'image' | 'video' | 'gif';
export type EventType = 'view' | 'click' | 'close' | 'share';
export type TargetType = 'gym' | 'city' | 'state' | 'user_type';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  content?: string;
  adType: AdType;
  status: AdStatus;
  targetAudience: TargetAudience;
  priority: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clicks: number;
  impressions: number;
  createdBy?: string;
  updatedBy?: string;
  created_at: string;
  updated_at?: string;
  
  // Related data - includes user info from backend
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  updater?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  media?: AdvertisementMedia[];
  targeting?: AdvertisementTargeting[];
  schedules?: AdvertisementSchedule[];
  analytics?: AdvertisementAnalytics;
}

export interface AdvertisementMedia {
  id: string;
  entity_id: string;
  entity_type: string;
  media_type: MediaType;
  location: string;
  url: string;
  alt_text?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  record_status: number;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdvertisementTargeting {
  id: string;
  advertisementId: string;
  targetType: TargetType;
  targetValue: string;
  created_at: string;
}

export interface AdvertisementSchedule {
  id: string;
  advertisementId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AdvertisementAnalytics {
  id: string;
  advertisementId: string;
  userId?: string;
  eventType: EventType;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  browserType?: string;
  osType?: string;
  referrerUrl?: string;
  sessionId?: string;
  viewDuration?: number;
  locationData?: any;
  event_timestamp: string;
}

// Request/Response interfaces
export interface CreateAdvertisementRequest {
  title: string;
  description?: string;
  content?: string;
  adType: AdType;
  targetAudience: TargetAudience;
  priority?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  media?: Omit<AdvertisementMedia, 'id' | 'advertisementId' | 'createTimestamp'>[];
  targeting?: Omit<AdvertisementTargeting, 'id' | 'advertisementId' | 'createTimestamp'>[];
  schedules?: Omit<AdvertisementSchedule, 'id' | 'advertisementId'>[];
}

export interface UpdateAdvertisementRequest {
  title?: string;
  description?: string;
  content?: string;
  adType?: AdType;
  status?: AdStatus;
  targetAudience?: TargetAudience;
  priority?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  media?: Omit<AdvertisementMedia, 'id' | 'advertisementId' | 'createTimestamp'>[];
  targeting?: Omit<AdvertisementTargeting, 'id' | 'advertisementId' | 'createTimestamp'>[];
  schedules?: Omit<AdvertisementSchedule, 'id' | 'advertisementId'>[];
}

export interface AdvertisementFilters {
  status?: AdStatus;
  adType?: AdType;
  targetAudience?: TargetAudience;
  startDate?: string;
  endDate?: string;
  minBudget?: number;
  maxBudget?: number;
  createdBy?: string;
  search?: string;
  hasActiveSchedule?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdvertisementStats {
  totalAds: number;
  activeAds: number;
  inactiveAds: number;
  draftAds: number;
  expiredAds: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  totalBudget: number;
  topPerformingAds: {
    id: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }[];
}

export interface PaginatedAdvertisements {
  advertisements: Advertisement[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  stats?: AdvertisementStats;
}

export interface AdvertisementPerformance {
  advertisementId: string;
  title: string;
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  ctr: number;
  avgViewDuration?: number;
  conversionRate?: number;
  costPerClick?: number;
  revenue?: number;
  dailyStats: {
    date: string;
    views: number;
    clicks: number;
    shares: number;
  }[];
  geographicData: {
    location: string;
    views: number;
    clicks: number;
  }[];
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

// Display configuration for different ad types
export interface AdDisplayConfig {
  banner: {
    position: 'top' | 'bottom' | 'sidebar';
    autoHide?: boolean;
    hideDelay?: number;
  };
  popup: {
    trigger: 'immediate' | 'scroll' | 'exit_intent' | 'time_based';
    delay?: number;
    scrollPercentage?: number;
  };
  card: {
    placement: 'home' | 'gym_list' | 'profile' | 'checkout';
    blendWithContent: boolean;
  };
  video: {
    autoplay: boolean;
    controls: boolean;
    muted: boolean;
    loop: boolean;
  };
  carousel: {
    autoSlide: boolean;
    slideInterval?: number;
    showDots: boolean;
    showArrows: boolean;
  };
}
