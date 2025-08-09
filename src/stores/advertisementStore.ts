import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Advertisement,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  AdvertisementFilters,
  AdvertisementStats,
  PaginatedAdvertisements,
  AdvertisementPerformance,
  AdType,
  AdStatus,
  TargetAudience
} from '../models/Advertisement';
import { advertisementService } from '../services/advertisementService';

interface AdvertisementState {
  // State
  advertisements: Advertisement[];
  currentAdvertisement: Advertisement | null;
  advertisementStats: AdvertisementStats | null;
  performance: Record<string, AdvertisementPerformance>;
  activeAds: Advertisement[]; // For displaying on frontend
  
  // Pagination & Filters
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  filters: AdvertisementFilters;
  
  // UI States
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  selectedAdvertisements: string[];
  
  // Actions - CRUD
  fetchAdvertisements: (page?: number, limit?: number, filters?: AdvertisementFilters) => Promise<void>;
  fetchAdvertisementById: (id: string) => Promise<void>;
  createAdvertisement: (data: CreateAdvertisementRequest) => Promise<Advertisement | null>;
  updateAdvertisement: (id: string, data: UpdateAdvertisementRequest) => Promise<Advertisement | null>;
  deleteAdvertisement: (id: string) => Promise<boolean>;
  duplicateAdvertisement: (id: string, newTitle?: string) => Promise<Advertisement | null>;
  
  // Actions - Status Management
  toggleAdvertisementStatus: (id: string, status: 'active' | 'inactive') => Promise<boolean>;
  activateAdvertisement: (id: string) => Promise<boolean>;
  deactivateAdvertisement: (id: string) => Promise<boolean>;
  
  // Actions - Bulk Operations
  bulkUpdateAdvertisements: (ids: string[], updates: Partial<UpdateAdvertisementRequest>) => Promise<boolean>;
  bulkDeleteAdvertisements: (ids: string[]) => Promise<boolean>;
  
  // Actions - Analytics & Performance
  fetchAdvertisementStats: () => Promise<void>;
  fetchAdvertisementPerformance: (id: string, startDate?: string, endDate?: string) => Promise<void>;
  trackEvent: (id: string, eventType: 'view' | 'click' | 'close' | 'share', userId?: string) => Promise<void>;
  
  // Actions - Public API (for displaying ads)
  fetchActiveAdvertisements: (adType?: AdType, placement?: string, limit?: number) => Promise<void>;
  fetchTargetedAdvertisements: (targetType: string, targetValue: string) => Promise<void>;
  
  // Actions - UI Management
  setFilters: (filters: Partial<AdvertisementFilters>) => void;
  clearFilters: () => void;
  setSelectedAdvertisements: (ids: string[]) => void;
  toggleAdvertisementSelection: (id: string) => void;
  clearSelection: () => void;
  clearError: () => void;
  
  // Actions - Media
  uploadMedia: (advertisementId: string, file: File, mediaType: 'image' | 'video' | 'gif', altText?: string) => Promise<{ mediaUrl: string; mediaId: string } | null>;
  deleteMedia: (advertisementId: string, mediaId: string) => Promise<boolean>;
  
  // Actions - Export
  exportAdvertisements: (format?: 'csv' | 'xlsx') => Promise<void>;
}

const initialFilters: AdvertisementFilters = {};

const initialPagination = {
  currentPage: 1,
  totalPages: 0,
  total: 0,
  limit: 10
};

export const useAdvertisementStore = create<AdvertisementState>()(
  devtools(
    (set, get) => ({
      // Initial State
      advertisements: [],
      currentAdvertisement: null,
      advertisementStats: null,
      performance: {},
      activeAds: [],
      pagination: initialPagination,
      filters: initialFilters,
      loading: false,
      creating: false,
      updating: false,
      deleting: false,
      error: null,
      selectedAdvertisements: [],

      // CRUD Actions
      fetchAdvertisements: async (page = 1, limit = 10, filters) => {
        set({ loading: true, error: null });
        try {
          const currentFilters = filters || get().filters;
          const response = await advertisementService.getAdvertisements(page, limit, currentFilters);
          
          if (response.success && response.data) {
            set({
              advertisements: response.data.advertisements,
              pagination: response.data.pagination,
              advertisementStats: response.data.stats || get().advertisementStats,
              loading: false
            });
          } else {
            set({ error: response.message, loading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch advertisements', loading: false });
          console.error('Error fetching advertisements:', error);
        }
      },

      fetchAdvertisementById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await advertisementService.getAdvertisementById(id);
          
          if (response.success && response.data) {
            set({
              currentAdvertisement: response.data,
              loading: false
            });
          } else {
            set({ error: response.message, loading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch advertisement', loading: false });
          console.error('Error fetching advertisement:', error);
        }
      },

      createAdvertisement: async (data: CreateAdvertisementRequest) => {
        set({ creating: true, error: null });
        try {
          const response = await advertisementService.createAdvertisement(data);
          
          if (response.success && response.data) {
            // Add to the beginning of the list
            set(state => ({
              advertisements: [response.data!, ...state.advertisements],
              creating: false
            }));
            
            // Refresh stats
            get().fetchAdvertisementStats();
            
            return response.data;
          } else {
            set({ error: response.message, creating: false });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to create advertisement', creating: false });
          console.error('Error creating advertisement:', error);
          return null;
        }
      },

      updateAdvertisement: async (id: string, data: UpdateAdvertisementRequest) => {
        set({ updating: true, error: null });
        try {
          const response = await advertisementService.updateAdvertisement(id, data);
          
          if (response.success && response.data) {
            set(state => ({
              advertisements: state.advertisements.map(ad => 
                ad.id === id ? response.data! : ad
              ),
              currentAdvertisement: state.currentAdvertisement?.id === id 
                ? response.data! 
                : state.currentAdvertisement,
              updating: false
            }));
            
            // Refresh stats
            get().fetchAdvertisementStats();
            
            return response.data;
          } else {
            set({ error: response.message, updating: false });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to update advertisement', updating: false });
          console.error('Error updating advertisement:', error);
          return null;
        }
      },

      deleteAdvertisement: async (id: string) => {
        set({ deleting: true, error: null });
        try {
          const response = await advertisementService.deleteAdvertisement(id);
          
          if (response.success) {
            set(state => ({
              advertisements: state.advertisements.filter(ad => ad.id !== id),
              currentAdvertisement: state.currentAdvertisement?.id === id 
                ? null 
                : state.currentAdvertisement,
              selectedAdvertisements: state.selectedAdvertisements.filter(selectedId => selectedId !== id),
              deleting: false
            }));
            
            // Refresh stats
            get().fetchAdvertisementStats();
            
            return true;
          } else {
            set({ error: response.message, deleting: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to delete advertisement', deleting: false });
          console.error('Error deleting advertisement:', error);
          return false;
        }
      },

      duplicateAdvertisement: async (id: string, newTitle?: string) => {
        set({ creating: true, error: null });
        try {
          const response = await advertisementService.duplicateAdvertisement(id, newTitle);
          
          if (response.success && response.data) {
            set(state => ({
              advertisements: [response.data!, ...state.advertisements],
              creating: false
            }));
            
            return response.data;
          } else {
            set({ error: response.message, creating: false });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to duplicate advertisement', creating: false });
          console.error('Error duplicating advertisement:', error);
          return null;
        }
      },

      // Status Management
      toggleAdvertisementStatus: async (id: string, status: 'active' | 'inactive') => {
        try {
          const response = await advertisementService.toggleAdvertisementStatus(id, status);
          
          if (response.success && response.data) {
            set(state => ({
              advertisements: state.advertisements.map(ad => 
                ad.id === id ? response.data! : ad
              ),
              currentAdvertisement: state.currentAdvertisement?.id === id 
                ? response.data! 
                : state.currentAdvertisement
            }));
            
            return true;
          } else {
            set({ error: response.message });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to update advertisement status' });
          console.error('Error updating advertisement status:', error);
          return false;
        }
      },

      activateAdvertisement: async (id: string) => {
        return get().toggleAdvertisementStatus(id, 'active');
      },

      deactivateAdvertisement: async (id: string) => {
        return get().toggleAdvertisementStatus(id, 'inactive');
      },

      // Bulk Operations
      bulkUpdateAdvertisements: async (ids: string[], updates: Partial<UpdateAdvertisementRequest>) => {
        set({ updating: true, error: null });
        try {
          const response = await advertisementService.bulkUpdateAdvertisements(ids, updates);
          
          if (response.success) {
            // Refresh the advertisements list
            await get().fetchAdvertisements(get().pagination.currentPage, get().pagination.limit, get().filters);
            set({ updating: false });
            return true;
          } else {
            set({ error: response.message, updating: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to bulk update advertisements', updating: false });
          console.error('Error bulk updating advertisements:', error);
          return false;
        }
      },

      bulkDeleteAdvertisements: async (ids: string[]) => {
        set({ deleting: true, error: null });
        try {
          const response = await advertisementService.bulkDeleteAdvertisements(ids);
          
          if (response.success) {
            set(state => ({
              advertisements: state.advertisements.filter(ad => !ids.includes(ad.id)),
              selectedAdvertisements: [],
              deleting: false
            }));
            
            // Refresh stats
            get().fetchAdvertisementStats();
            
            return true;
          } else {
            set({ error: response.message, deleting: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to bulk delete advertisements', deleting: false });
          console.error('Error bulk deleting advertisements:', error);
          return false;
        }
      },

      // Analytics & Performance
      fetchAdvertisementStats: async () => {
        try {
          const response = await advertisementService.getAdvertisementStats();
          
          if (response.success && response.data) {
            set({ advertisementStats: response.data });
          }
        } catch (error) {
          console.error('Error fetching advertisement stats:', error);
          // Provide fallback stats to prevent UI errors
          set({ 
            advertisementStats: {
              totalAds: 0,
              activeAds: 0,
              inactiveAds: 0,
              draftAds: 0,
              expiredAds: 0,
              totalClicks: 0,
              totalImpressions: 0,
              averageCTR: 0,
              totalBudget: 0,
              topPerformingAds: []
            }
          });
        }
      },

      fetchAdvertisementPerformance: async (id: string, startDate?: string, endDate?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await advertisementService.getAdvertisementPerformance(id, startDate, endDate);
          
          if (response.success && response.data) {
            set(state => ({
              performance: {
                ...state.performance,
                [id]: response.data!
              },
              loading: false
            }));
          } else {
            set({ error: response.message, loading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch advertisement performance', loading: false });
          console.error('Error fetching advertisement performance:', error);
        }
      },

      trackEvent: async (id: string, eventType: 'view' | 'click' | 'close' | 'share', userId?: string) => {
        try {
          await advertisementService.trackAdvertisementEvent(id, eventType, userId);
          
          // Update local click/impression count
          if (eventType === 'view') {
            set(state => ({
              advertisements: state.advertisements.map(ad => 
                ad.id === id ? { ...ad, impressions: ad.impressions + 1 } : ad
              ),
              activeAds: state.activeAds.map(ad => 
                ad.id === id ? { ...ad, impressions: ad.impressions + 1 } : ad
              )
            }));
          } else if (eventType === 'click') {
            set(state => ({
              advertisements: state.advertisements.map(ad => 
                ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad
              ),
              activeAds: state.activeAds.map(ad => 
                ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad
              )
            }));
          }
        } catch (error) {
          console.error('Error tracking advertisement event:', error);
        }
      },

      // Public API
      fetchActiveAdvertisements: async (adType?: AdType, placement?: string, limit = 10) => {
        try {
          const response = await advertisementService.getActiveAdvertisements(adType, placement, limit);
          
          if (response.success && response.data) {
            set({ activeAds: response.data });
          }
        } catch (error) {
          console.error('Error fetching active advertisements:', error);
        }
      },

      fetchTargetedAdvertisements: async (targetType: string, targetValue: string) => {
        try {
          const response = await advertisementService.getAdvertisementsByTargeting(targetType, targetValue);
          
          if (response.success && response.data) {
            set(state => ({
              activeAds: [...state.activeAds, ...response.data!]
            }));
          }
        } catch (error) {
          console.error('Error fetching targeted advertisements:', error);
        }
      },

      // UI Management
      setFilters: (filters: Partial<AdvertisementFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      clearFilters: () => {
        set({ filters: initialFilters });
      },

      setSelectedAdvertisements: (ids: string[]) => {
        set({ selectedAdvertisements: ids });
      },

      toggleAdvertisementSelection: (id: string) => {
        set(state => ({
          selectedAdvertisements: state.selectedAdvertisements.includes(id)
            ? state.selectedAdvertisements.filter(selectedId => selectedId !== id)
            : [...state.selectedAdvertisements, id]
        }));
      },

      clearSelection: () => {
        set({ selectedAdvertisements: [] });
      },

      clearError: () => {
        set({ error: null });
      },

      // Media Management
      uploadMedia: async (advertisementId: string, file: File, mediaType: 'image' | 'video' | 'gif', altText?: string) => {
        try {
          const response = await advertisementService.uploadAdvertisementMedia(advertisementId, file, mediaType, altText);
          
          if (response.success && response.data) {
            // Refresh the current advertisement to get updated media
            if (get().currentAdvertisement?.id === advertisementId) {
              get().fetchAdvertisementById(advertisementId);
            }
            
            return response.data;
          } else {
            set({ error: response.message });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to upload media' });
          console.error('Error uploading media:', error);
          return null;
        }
      },

      deleteMedia: async (advertisementId: string, mediaId: string) => {
        try {
          const response = await advertisementService.deleteAdvertisementMedia(advertisementId, mediaId);
          
          if (response.success) {
            // Refresh the current advertisement to get updated media
            if (get().currentAdvertisement?.id === advertisementId) {
              get().fetchAdvertisementById(advertisementId);
            }
            
            return true;
          } else {
            set({ error: response.message });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to delete media' });
          console.error('Error deleting media:', error);
          return false;
        }
      },

      // Export
      exportAdvertisements: async (format: 'csv' | 'xlsx' = 'csv') => {
        set({ loading: true, error: null });
        try {
          await advertisementService.exportAdvertisements(get().filters, format);
          set({ loading: false });
        } catch (error) {
          set({ error: 'Failed to export advertisements', loading: false });
          console.error('Error exporting advertisements:', error);
        }
      }
    }),
    {
      name: 'advertisement-store'
    }
  )
);
