import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';
import {
  Advertisement,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  AdvertisementFilters,
  AdvertisementStats,
  PaginatedAdvertisements,
  AdvertisementPerformance,
  AdvertisementAnalytics,
  EventType
} from '../models/Advertisement';

class AdvertisementService {
  private readonly baseEndpoint = '/advertisements';

  // CRUD Operations
  async getAdvertisements(
    page = 1,
    limit = 10,
    filters?: AdvertisementFilters
  ): Promise<ApiResponse<PaginatedAdvertisements>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return apiClient.get<PaginatedAdvertisements>(
      `${this.baseEndpoint}?${queryParams.toString()}`
    );
  }

  async getAdvertisementById(id: string): Promise<ApiResponse<Advertisement>> {
    return apiClient.get<Advertisement>(`${this.baseEndpoint}/${id}`);
  }

  async createAdvertisement(data: CreateAdvertisementRequest): Promise<ApiResponse<Advertisement>> {
    return apiClient.post<Advertisement>(this.baseEndpoint, data);
  }

  async updateAdvertisement(id: string, data: UpdateAdvertisementRequest): Promise<ApiResponse<Advertisement>> {
    return apiClient.put<Advertisement>(`${this.baseEndpoint}/${id}`, data);
  }

  async deleteAdvertisement(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async duplicateAdvertisement(id: string, newTitle?: string): Promise<ApiResponse<Advertisement>> {
    return apiClient.post<Advertisement>(`${this.baseEndpoint}/${id}/duplicate`, {
      title: newTitle
    });
  }

  // Status Management
  async toggleAdvertisementStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Advertisement>> {
    return apiClient.put<Advertisement>(`${this.baseEndpoint}/${id}/status`, { status });
  }

  async activateAdvertisement(id: string): Promise<ApiResponse<Advertisement>> {
    return this.toggleAdvertisementStatus(id, 'active');
  }

  async deactivateAdvertisement(id: string): Promise<ApiResponse<Advertisement>> {
    return this.toggleAdvertisementStatus(id, 'inactive');
  }

  // Bulk Operations
  async bulkUpdateAdvertisements(
    advertisementIds: string[],
    updates: Partial<UpdateAdvertisementRequest>
  ): Promise<ApiResponse<{ updated: number; errors: string[] }>> {
    return apiClient.patch(
      `${this.baseEndpoint}/bulk-update`,
      { advertisementIds, updates }
    );
  }

  async bulkDeleteAdvertisements(advertisementIds: string[]): Promise<ApiResponse<{ deleted: number; errors: string[] }>> {
    return apiClient.post(
      `${this.baseEndpoint}/bulk-delete`,
      { advertisementIds }
    );
  }

  // Analytics & Performance
  async getAdvertisementStats(): Promise<ApiResponse<AdvertisementStats>> {
    return apiClient.get<AdvertisementStats>(`${this.baseEndpoint}/stats`);
  }

  async getAdvertisementPerformance(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AdvertisementPerformance>> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiClient.get<AdvertisementPerformance>(
      `${this.baseEndpoint}/${id}/performance?${queryParams.toString()}`
    );
  }

  async getAdvertisementAnalytics(
    id: string,
    days = 30
  ): Promise<ApiResponse<AdvertisementAnalytics[]>> {
    return apiClient.get<AdvertisementAnalytics[]>(
      `${this.baseEndpoint}/${id}/analytics?days=${days}`
    );
  }

  async trackAdvertisementEvent(
    id: string,
    eventType: EventType,
    userId?: string,
    metadata?: any
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.baseEndpoint}/${id}/track`, {
      eventType,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }

  // Public API for displaying ads (no authentication required)
  async getActiveAdvertisements(
    adType?: string,
    placement?: string,
    limit = 10
  ): Promise<ApiResponse<Advertisement[]>> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      status: 'active'
    });
    
    if (adType) queryParams.append('adType', adType);
    if (placement) queryParams.append('placement', placement);

    return apiClient.get<Advertisement[]>(`${this.baseEndpoint}/public?${queryParams.toString()}`);
  }

  async getAdvertisementsByTargeting(
    targetType: string,
    targetValue: string,
    limit = 5
  ): Promise<ApiResponse<Advertisement[]>> {
    return apiClient.get<Advertisement[]>(
      `${this.baseEndpoint}/targeted?type=${targetType}&value=${encodeURIComponent(targetValue)}&limit=${limit}`
    );
  }

  // Media Management
  async uploadAdvertisementMedia(
    advertisementId: string,
    file: File,
    mediaType: 'image' | 'video' | 'gif',
    altText?: string
  ): Promise<ApiResponse<{ mediaUrl: string; mediaId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    if (altText) formData.append('altText', altText);

    return apiClient.postFormData<{ mediaUrl: string; mediaId: string }>(
      `${this.baseEndpoint}/${advertisementId}/media`,
      formData
    );
  }

  async deleteAdvertisementMedia(
    advertisementId: string,
    mediaId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${advertisementId}/media/${mediaId}`);
  }

  // Export & Import
  async exportAdvertisements(
    filters?: AdvertisementFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<void> {
    const queryParams = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    // Get token from auth storage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.tokens?.accessToken;
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Type': 'application/json',
    };

    const exportUrl = `${API_CONFIG.BASE_URL}${this.baseEndpoint}/export?${queryParams.toString()}`;
    
    try {
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to export advertisements: ${response.status} ${response.statusText}`);
      }

      // Get filename from headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `advertisements_export_${Date.now()}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // A/B Testing
  async createAdvertisementVariant(
    originalId: string,
    variantData: Partial<CreateAdvertisementRequest>
  ): Promise<ApiResponse<Advertisement>> {
    return apiClient.post<Advertisement>(`${this.baseEndpoint}/${originalId}/variant`, variantData);
  }

  async getAdvertisementVariants(originalId: string): Promise<ApiResponse<Advertisement[]>> {
    return apiClient.get<Advertisement[]>(`${this.baseEndpoint}/${originalId}/variants`);
  }

  async compareVariantPerformance(
    originalId: string,
    variantId: string,
    days = 30
  ): Promise<ApiResponse<{
    original: AdvertisementPerformance;
    variant: AdvertisementPerformance;
    comparison: {
      ctrImprovement: number;
      clickImprovement: number;
      conversionImprovement: number;
      significantDifference: boolean;
    };
  }>> {
    return apiClient.get(
      `${this.baseEndpoint}/${originalId}/compare/${variantId}?days=${days}`
    );
  }

  // Scheduling
  async scheduleAdvertisement(
    id: string,
    startDate: string,
    endDate?: string
  ): Promise<ApiResponse<Advertisement>> {
    return apiClient.post<Advertisement>(`${this.baseEndpoint}/${id}/schedule`, {
      startDate,
      endDate
    });
  }

  async getScheduledAdvertisements(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Advertisement[]>> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiClient.get<Advertisement[]>(`${this.baseEndpoint}/scheduled?${queryParams.toString()}`);
  }
}

export const advertisementService = new AdvertisementService();
