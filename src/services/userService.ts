import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  type?: '1' | '2' | '3'; // 1-user, 2-owner, 3-admin
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  activeStatus?: '0' | '1';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  type: '1' | '2' | '3';
  activeStatus: '0' | '1';
  isVerified: boolean;
  createTimestamp: string;
  updateTimestamp?: string;
}

export interface FitnessGoal {
  goalId: number;
  priority: number;
  targetDate?: string;
}

export interface NotificationSettings {
  userEmail: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PrivacySettings {
  userEmail: string;
  showEmail: boolean;
  showProfilePicture: boolean;
}

export interface AppPreferences {
  userEmail: string;
  theme: string;
  language: string;
}

export interface EmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  userEmail?: string;
}

export interface ProfileImageResponse {
  id: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
  isActive: boolean;
  uploadedAt: string;
}

class UserService {
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${API_CONFIG.ENDPOINTS.USERS}/change-password/${email}`, {
      currentPassword,
      newPassword
    });
  }

  async getCompleteProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings`);
  }

  async updateUserProfile(profileData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings`, profileData);
  }

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.get<NotificationSettings>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/notifications`);
  }
  
  async updateNotificationSettings(settings: NotificationSettings): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.put<NotificationSettings>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/notifications`, settings);
  }

  async getPrivacySettings(): Promise<ApiResponse<PrivacySettings>> {
    return apiClient.get<PrivacySettings>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/privacy`);
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<ApiResponse<PrivacySettings>> {
    return apiClient.put<PrivacySettings>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/privacy`, settings);
  }

  async getAppPreferences(): Promise<ApiResponse<AppPreferences>> {
    return apiClient.get<AppPreferences>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/preferences`);
  }

  async updateAppPreferences(prefs: AppPreferences): Promise<ApiResponse<AppPreferences>> {
    return apiClient.put<AppPreferences>(`${API_CONFIG.ENDPOINTS.USERS}/profile/settings/preferences`, prefs);
  }

  async getFitnessGoals(): Promise<ApiResponse<FitnessGoal[]>> {
    return apiClient.get<FitnessGoal[]>(`${API_CONFIG.ENDPOINTS.USERS}/profile/fitness-goals`);
  }
  
  async updateFitnessGoals(goalIds: FitnessGoal[]): Promise<ApiResponse<FitnessGoal[]>> {
    return apiClient.put<FitnessGoal[]>(`${API_CONFIG.ENDPOINTS.USERS}/profile/fitness-goals`, { goalIds });
  }

  async addEmergencyContact(contact: EmergencyContact): Promise<ApiResponse<EmergencyContact>> {
    return apiClient.post<EmergencyContact>(`${API_CONFIG.ENDPOINTS.USERS}/profile/emergency-contacts`, contact);
  }

  async updateEmergencyContact(contactId: number, contact: EmergencyContact): Promise<ApiResponse<EmergencyContact>> {
    return apiClient.put<EmergencyContact>(`${API_CONFIG.ENDPOINTS.USERS}/profile/emergency-contacts/${contactId}`, contact);
  }

  async deleteEmergencyContact(contactId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/profile/emergency-contacts/${contactId}`);
  }

  async getAllUsers(page?: number, limit?: number): Promise<ApiResponse<{ users: User[], totalPages: number, currentPage: number, totalUsers: number }>> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<{ users: User[], totalPages: number, currentPage: number, totalUsers: number }>(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(API_CONFIG.ENDPOINTS.USERS, userData);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`${API_CONFIG.ENDPOINTS.USERS}/search?q=${encodeURIComponent(query)}`);
  }

  // Profile Image Management
  async uploadProfileImage(file: File): Promise<ApiResponse<ProfileImageResponse>> {
    const formData = new FormData();
    formData.append('image', file); // Changed from 'file' to 'image' to match backend
    return apiClient.post<ProfileImageResponse>(`${API_CONFIG.ENDPOINTS.USERS}/profile/image`, formData);
  }

  async getProfileImageUrl(): Promise<string> {
    try {
      const response = await apiClient.get<{ imageUrl: string }>(`${API_CONFIG.ENDPOINTS.USERS}/profile/image/url`);
      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl;
      }
      throw new Error('Profile image URL not found');
    } catch (error) {
      console.error('Error getting profile image URL:', error);
      throw error;
    }
  }

  async deleteProfileImage(imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/profile/image/${imageId}`);
  }
}

export const userService = new UserService();
