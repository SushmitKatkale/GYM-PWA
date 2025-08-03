import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../services/userService';
import type { CreateUserRequest, UpdateUserRequest, User } from '../services/userService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('userService', () => {
  const mockToken = 'mock-token';
  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    type: '1',
    activeStatus: '1',
    isVerified: true,
    createTimestamp: '2024-01-01T00:00:00Z',
    updateTimestamp: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: [mockUser],
          totalPages: 1,
          currentPage: 1,
          totalUsers: 1
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.getAllUsers(mockToken, 1, 10);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users?page=1&limit=10',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Unauthorized',
        error: 'Invalid token'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => mockErrorResponse,
      });

      const result = await userService.getAllUsers(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await userService.getAllUsers(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error occurred. Please check your connection and try again.');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserData: CreateUserRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        phoneNumber: '+1987654321',
        type: '1'
      };

      const mockResponse = {
        success: true,
        message: 'User created successfully',
        data: { ...mockUser, ...createUserData, id: '2' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.createUser(createUserData, mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(createUserData),
        }
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUserRequest = {
        firstName: 'Johnny',
        lastName: 'Doe',
        phoneNumber: '+1111111111'
      };

      const mockResponse = {
        success: true,
        message: 'User updated successfully',
        data: { ...mockUser, ...updateData }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.updateUser('1', updateData, mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.deleteUser('1', mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Search completed',
        data: [mockUser]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.searchUsers('john', mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/search?q=john',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User found',
        data: mockUser
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userService.getUserById('1', mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });
  });
});
