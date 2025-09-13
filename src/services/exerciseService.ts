import { API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface MediaItem {
  id: number;
  url: string;
  mimeType: string;
  altText: string;
  createdAt: string;
}

export interface ExerciseMedia {
  videos: MediaItem[];
  thumbnails: MediaItem[];
  primaryVideo: MediaItem | null;
  primaryThumbnail: MediaItem | null;
}

export interface Exercise {
  id: number;
  exerciseTitle: string;
  description?: string;
  instructions?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  muscleGroups?: string[];
  equipmentNeeded?: string[];
  calories?: number;
  sets?: number;
  reps?: string;
  restTime?: number;
  tags?: string[];
  isPublic: boolean;
  gymId?: number;
  createdBy?: number;
  updatedBy?: number;
  recordStatus: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  gym?: {
    id: number;
    name: string;
    address: string;
  };
  formattedDuration?: string;
  youtubeThumbnail?: string;
  youtubeVideoId?: string;
  media?: ExerciseMedia;
}

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  muscleGroup?: string;
  equipment?: string;
  search?: string;
  gymId?: number;
  includePrivate?: boolean;
}

export interface ExerciseResponse {
  success: boolean;
  data: {
    exercises: Exercise[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface CategoryResponse {
  success: boolean;
  data: {
    category: string;
    count: number;
  }[];
}

export interface MuscleGroupsResponse {
  success: boolean;
  data: string[];
}

export interface EquipmentResponse {
  success: boolean;
  data: string[];
}

class ExerciseService {
  private baseUrl = API_CONFIG.ENDPOINTS.EXERCISES;
  private mediaBaseUrl = API_CONFIG.BASE_URL + '/exercise-media';

  // Helper method to get auth token (same as apiClient)
  private getAuthToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.tokens?.accessToken;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }

  // Get all exercises with filtering and pagination
  async getExercises(filters: ExerciseFilters = {}): Promise<ExerciseResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ExerciseResponse>(url);
    return response;
  }

  // Get single exercise by ID
  async getExerciseById(id: number): Promise<{ success: boolean; data: Exercise }> {
    const response = await apiClient.get<{ success: boolean; data: Exercise }>(`${this.baseUrl}/${id}`);
    return response;
  }

  // Search exercises
  async searchExercises(query: string, filters: { 
    limit?: number; 
    category?: string; 
    difficulty?: string; 
  } = {}): Promise<{ success: boolean; data: Exercise[] }> {
    const queryParams = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get<{ success: boolean; data: Exercise[] }>(
      `${this.baseUrl}/search?${queryParams.toString()}`
    );
    return response;
  }

  // Get exercises by category
  async getExercisesByCategory(
    category: string, 
    filters: { limit?: number; difficulty?: string } = {}
  ): Promise<{ success: boolean; data: Exercise[] }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<{ success: boolean; data: Exercise[] }>(url);
    return response;
  }

  // Get exercise categories
  async getCategories(): Promise<CategoryResponse> {
    const response = await apiClient.get<CategoryResponse>(`${this.baseUrl}/categories`);
    return response;
  }

  // Get muscle groups
  async getMuscleGroups(): Promise<MuscleGroupsResponse> {
    const response = await apiClient.get<MuscleGroupsResponse>(`${this.baseUrl}/muscle-groups`);
    return response;
  }

  // Get equipment list
  async getEquipmentList(): Promise<EquipmentResponse> {
    const response = await apiClient.get<EquipmentResponse>(`${this.baseUrl}/equipment`);
    return response;
  }

  // Get popular exercises
  async getPopularExercises(limit: number = 10): Promise<{ success: boolean; data: Exercise[] }> {
    const response = await apiClient.get<{ success: boolean; data: Exercise[] }>(
      `${this.baseUrl}/popular?limit=${limit}`
    );
    return response;
  }

  // Create exercise (Admin only)
  async createExercise(exercise: Partial<Exercise>): Promise<{ success: boolean; data: Exercise }> {
    const response = await apiClient.post<{ success: boolean; data: Exercise }>(this.baseUrl, exercise);
    return response;
  }

  // Update exercise (Admin only)
  async updateExercise(id: number, exercise: Partial<Exercise>): Promise<{ success: boolean; data: Exercise }> {
    const response = await apiClient.put<{ success: boolean; data: Exercise }>(`${this.baseUrl}/${id}`, exercise);
    return response;
  }

  // Delete exercise (Admin only)
  async deleteExercise(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
    return response;
  }

  // Toggle exercise visibility (Admin only)
  async toggleExerciseVisibility(id: number): Promise<{ success: boolean; data: { id: number; isPublic: boolean } }> {
    const response = await apiClient.patch<{ success: boolean; data: { id: number; isPublic: boolean } }>(
      `${this.baseUrl}/${id}/visibility`
    );
    return response;
  }

  // Media-related methods

  // Upload exercise video
  async uploadExerciseVideo(
    exerciseId: number, 
    videoFile: File, 
    altText?: string
  ): Promise<{ success: boolean; data: MediaItem }> {
    const formData = new FormData();
    formData.append('video', videoFile);
    if (altText) {
      formData.append('altText', altText);
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.mediaBaseUrl}/exercises/${exerciseId}/video`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload video');
    }
    return result;
  }

  // Upload exercise thumbnail
  async uploadExerciseThumbnail(
    exerciseId: number, 
    thumbnailFile: File, 
    altText?: string
  ): Promise<{ success: boolean; data: MediaItem }> {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);
    if (altText) {
      formData.append('altText', altText);
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.mediaBaseUrl}/exercises/${exerciseId}/thumbnail`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload thumbnail');
    }
    return result;
  }

  // Upload both video and thumbnail simultaneously
  async uploadExerciseMedia(
    exerciseId: number, 
    files: { video?: File; thumbnail?: File }, 
    altTexts: { video?: string; thumbnail?: string } = {}
  ): Promise<{ success: boolean; data: { video?: MediaItem; thumbnail?: MediaItem } }> {
    const formData = new FormData();
    
    if (files.video) {
      formData.append('video', files.video);
      if (altTexts.video) {
        formData.append('videoAltText', altTexts.video);
      }
    }
    
    if (files.thumbnail) {
      formData.append('thumbnail', files.thumbnail);
      if (altTexts.thumbnail) {
        formData.append('thumbnailAltText', altTexts.thumbnail);
      }
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.mediaBaseUrl}/exercises/${exerciseId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload media');
    }
    return result;
  }

  // Get exercise media
  async getExerciseMedia(
    exerciseId: number, 
    mediaType?: 'video' | 'image'
  ): Promise<{ success: boolean; data: ExerciseMedia | MediaItem[] }> {
    const url = new URL(`${this.mediaBaseUrl}/exercises/${exerciseId}/media`);
    if (mediaType) {
      url.searchParams.set('mediaType', mediaType);
    }

    const response = await apiClient.get<{ success: boolean; data: ExerciseMedia | MediaItem[] }>(url.toString());
    return response;
  }

  // Delete exercise media
  async deleteExerciseMedia(mediaId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`${this.mediaBaseUrl}/${mediaId}`);
    return response;
  }

  // Get media by ID
  async getMediaById(mediaId: number): Promise<{ success: boolean; data: MediaItem }> {
    const response = await apiClient.get<{ success: boolean; data: MediaItem }>(`${this.mediaBaseUrl}/${mediaId}`);
    return response;
  }

  // Utility methods
  static getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  }

  static getYouTubeThumbnail(url: string, quality: string = 'mqdefault'): string | null {
    const videoId = ExerciseService.getYouTubeVideoId(url);
    if (!videoId) return null;
    
    // Available qualities: default, mqdefault, hqdefault, sddefault, maxresdefault
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }

  static formatDuration(minutes: number): string {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  static getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'strength': 'text-red-600 bg-red-100',
      'cardio': 'text-blue-600 bg-blue-100',
      'flexibility': 'text-green-600 bg-green-100',
      'balance': 'text-purple-600 bg-purple-100',
      'sports': 'text-orange-600 bg-orange-100',
      'yoga': 'text-indigo-600 bg-indigo-100',
      'pilates': 'text-pink-600 bg-pink-100',
      'crossfit': 'text-gray-600 bg-gray-100',
      'bodyweight': 'text-teal-600 bg-teal-100',
      'weightlifting': 'text-red-600 bg-red-100',
    };
    
    return colors[category] || 'text-gray-600 bg-gray-100';
  }
}

export const exerciseService = new ExerciseService();
export { ExerciseService };
