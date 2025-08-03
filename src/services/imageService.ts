import { buildApiUrl, API_CONFIG } from '../config/api';

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  error?: string;
}

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

  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response): Promise<ImageUploadResponse> {
    try {
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '';

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.join(', ');
          } else if (typeof data.error === 'object') {
            errorMessage = data.error.message || JSON.stringify(data.error);
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage
        };
      }

      return data;
    } catch (parseError) {
      return {
        success: false,
        message: response.ok 
          ? 'Invalid response format from server'
          : `HTTP ${response.status}: ${response.statusText}`,
        error: response.statusText
      };
    }
  }

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

        if (config.maxWidth && img.width > config.maxWidth) {
          resolve({
            valid: false,
            error: `Image width too large. Maximum width: ${config.maxWidth}px`,
            dimensions
          });
          return;
        }

        if (config.maxHeight && img.height > config.maxHeight) {
          resolve({
            valid: false,
            error: `Image height too large. Maximum height: ${config.maxHeight}px`,
            dimensions
          });
          return;
        }

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
    token: string, 
    title?: string, 
    createdBy?: string, 
    validation: Partial<ImageValidation> = {}
  ): Promise<ImageUploadResponse> {
    try {
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

      const url = buildApiUrl(`/gym-images/gym/${gymId}/upload`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Upload gym image network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async uploadMultipleGymImages(
    files: File[], 
    gymId: string | number, 
    token: string, 
    title?: string, 
    createdBy?: string, 
    validation: Partial<ImageValidation> = {}
  ): Promise<ImageUploadResponse[]> {
    const results: ImageUploadResponse[] = [];
    
    // Upload one image at a time
    for (const file of files) {
      const result = await this.uploadGymImage(file, gymId, token, title, createdBy, validation);
      results.push(result);
    }
    
    return results;
  }

  async deleteGymImage(imageUrl: string, token: string): Promise<ImageUploadResponse> {
    try {
      const url = buildApiUrl('/upload/gym-image');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(token)
        },
        body: JSON.stringify({ imageUrl }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete gym image network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
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
