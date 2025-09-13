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

  // === MEAL IMAGE METHODS ===

  async uploadMealImage(
    file: File, 
    mealId?: string | number, 
    title?: string, 
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
    formData.append('type', 'meal');
    
    if (mealId) {
      formData.append('mealId', mealId.toString());
    }
    
    if (title) {
      formData.append('title', title);
    }

    // For now, return a mock response since the meal image API might not be implemented yet
    // TODO: Replace with actual API endpoint when backend is ready
    try {
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock URL based on the file
      const mockUrl = this.createMockImageUrl(file.name, 'meal');
      
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size,
          mimetype: file.type
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Real implementation would be:
    // return apiClient.post<{ url: string; filename: string; size: number; mimetype: string }>(
    //   '/api/meals/upload-image',
    //   formData
    // );
  }

  async deleteMealImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock implementation - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Meal image delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }

    // Real implementation would be:
    // return apiClient.delete('/api/meals/delete-image', { body: { imageUrl } });
  }

  // === UTILITY METHODS ===

  /**
   * Generate a mock image URL for development
   */
  private createMockImageUrl(filename: string, type: 'meal' | 'gym' = 'meal'): string {
    const colors = {
      meal: '4ade80',
      gym: '3b82f6'
    };
    
    const name = filename.split('.')[0].substring(0, 10);
    const color = colors[type];
    
    return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(name)}`;
  }

  /**
   * Generate placeholder image URL for meals without images
   */
  getMealPlaceholder(mealName: string, category?: string): string {
    const categoryColors = {
      breakfast: 'ffbe0b',
      lunch: '8ecae6', 
      dinner: 'ffb3c6',
      snack: 'ffd166',
      drink: 'a8dadc',
      default: '4ade80'
    };

    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    const initials = mealName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    
    return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
  }

  /**
   * Compress image for optimal upload
   */
  async compressImage(file: File, quality: number = 0.8, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Check if URL is a valid image
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Check for common image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i;
    if (imageExtensions.test(url)) return true;
    
    // Check for data URLs
    if (url.startsWith('data:image/')) return true;
    
    // Check for blob URLs
    if (url.startsWith('blob:')) return true;
    
    // Check for placeholder services
    if (url.includes('placeholder.com') || url.includes('picsum.photos')) return true;
    
    return false;
  }
}

export const imageService = new ImageService();
