import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface ImageUploadResponse extends ApiResponse<{
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}> {}

export interface ImageValidation {
  maxSize: number; // in MB
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
}

class ImageService {
  private readonly defaultValidation: ImageValidation = {
    maxSize: 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 2048,
    maxHeight: 2048
  };


  validateImage(file: File, validation: Partial<ImageValidation> = {}): { valid: boolean; error?: string } {
    const config = { ...this.defaultValidation, ...validation };

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size too large. Maximum size: ${config.maxSize}MB`
      };
    }

    return { valid: true };
  }

  async validateImageDimensions(file: File, validation: Partial<ImageValidation> = {}): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
    const config = { ...this.defaultValidation, ...validation };

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const dimensions = { width: img.width, height: img.height };

        // Width and height validation removed - allow any dimensions

        resolve({ valid: true, dimensions });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Invalid image file or corrupted'
        });
      };

      img.src = url;
    });
  }

  async uploadGymImage(
    file: File, 
    gymId: string | number, 
    title?: string, 
    createdBy?: string, 
    validation: Partial<ImageValidation> = {}
  ): Promise<ImageUploadResponse> {
    // Validate file
    const basicValidation = this.validateImage(file, validation);
    if (!basicValidation.valid) {
      return {
        success: false,
        message: basicValidation.error!,
        error: basicValidation.error
      };
    }

    // Validate dimensions
    const dimensionValidation = await this.validateImageDimensions(file, validation);
    if (!dimensionValidation.valid) {
      return {
        success: false,
        message: dimensionValidation.error!,
        error: dimensionValidation.error
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    
    if (title) {
      formData.append('title', title);
    }
    
    if (createdBy) {
      formData.append('createdBy', createdBy);
    }

    return apiClient.post<{ url: string; filename: string; size: number; mimetype: string }>(
      `${API_CONFIG.ENDPOINTS.GYM_IMAGES}/gym/${gymId}/upload`,
      formData
    );
  }

  async uploadMultipleGymImages(
    files: File[], 
    gymId: string | number, 
    title?: string, 
    createdBy?: string, 
    validation: Partial<ImageValidation> = {}
  ): Promise<ImageUploadResponse[]> {
    const results: ImageUploadResponse[] = [];
    
    // Upload one image at a time
    for (const file of files) {
      const result = await this.uploadGymImage(file, gymId, title, createdBy, validation);
      results.push(result);
    }
    
    return results;
  }

  async getGymImages(gymId: string | number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_CONFIG.ENDPOINTS.GYM_IMAGES}/gym/${gymId}`);
  }

  async deleteGymImageById(imageId: string | number): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.GYM_IMAGES}/${imageId}`);
  }

  async deleteGymImage(imageUrl: string): Promise<ImageUploadResponse> {
    return apiClient.delete<{ url: string; filename: string; size: number; mimetype: string }>(
      '/upload/gym-image',
      { body: { imageUrl } }
    );
  }

  // Utility method to generate preview URL from File
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Utility method to revoke preview URL
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const imageService = new ImageService();
