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


class UserService {
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
}

export const userService = new UserService();
