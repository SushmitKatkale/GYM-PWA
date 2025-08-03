import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStore } from '../stores/userStore';
import { userService } from '../services/userService';
import { useAuthStore } from '../stores/authStore';

// Mock the services
vi.mock('../services/userService');
vi.mock('../stores/authStore');

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockUseAuthStore = useAuthStore as unknown as {
  getState: () => { getAccessToken: () => string | null };
};

describe('userStore', () => {
  const mockToken = 'mock-token';
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    type: '1' as const,
    activeStatus: '1' as const,
    isVerified: true,
    createTimestamp: '2024-01-01T00:00:00Z',
    updateTimestamp: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth store to return a token
    mockUseAuthStore.getState = vi.fn().mockReturnValue({
      getAccessToken: () => mockToken
    });

    // Reset store state
    useUserStore.setState({
      users: [],
      filteredUsers: [],
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
      isLoading: false,
      error: null,
      searchQuery: '',
      filterStatus: 'all'
    });
  });

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
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

      mockUserService.getAllUsers.mockResolvedValue(mockResponse);

      const { fetchUsers } = useUserStore.getState();
      const result = await fetchUsers();

      expect(result).toBe(true);
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(mockToken, 1, 10);

      const state = useUserStore.getState();
      expect(state.users).toEqual([mockUser]);
      expect(state.totalUsers).toBe(1);
      expect(state.isLoading).toBe(false);
    });

    it('should handle fetch failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to fetch users',
        error: 'Server error'
      };

      mockUserService.getAllUsers.mockResolvedValue(mockResponse);

      const { fetchUsers } = useUserStore.getState();
      const result = await fetchUsers();

      expect(result).toBe(false);

      const state = useUserStore.getState();
      expect(state.error).toBe('Failed to fetch users');
      expect(state.isLoading).toBe(false);
    });

    it('should handle missing token', async () => {
      mockUseAuthStore.getState = vi.fn().mockReturnValue({
        getAccessToken: () => null
      });

      const { fetchUsers } = useUserStore.getState();
      const result = await fetchUsers();

      expect(result).toBe(false);

      const state = useUserStore.getState();
      expect(state.error).toBe('No authentication token found');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserData = {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        phoneNumber: '+1987654321',
        type: '1' as const
      };

      const mockResponse = {
        success: true,
        message: 'User created successfully',
        data: { ...mockUser, ...createUserData, id: '2' }
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);
      
      // Mock fetchUsers to simulate refresh
      mockUserService.getAllUsers.mockResolvedValue({
        success: true,
        message: 'Users fetched',
        data: {
          users: [mockUser, mockResponse.data],
          totalPages: 1,
          currentPage: 1,
          totalUsers: 2
        }
      });

      const { createUser } = useUserStore.getState();
      const result = await createUser(createUserData);

      expect(result).toBe(true);
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserData, mockToken);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Set initial state with user
      useUserStore.setState({
        users: [mockUser],
        filteredUsers: [mockUser]
      });

      const updateData = {
        firstName: 'Johnny',
        phoneNumber: '+1111111111'
      };

      const mockResponse = {
        success: true,
        message: 'User updated successfully',
        data: { ...mockUser, ...updateData }
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);

      const { updateUser } = useUserStore.getState();
      const result = await updateUser('1', updateData);

      expect(result).toBe(true);
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', updateData, mockToken);

      const state = useUserStore.getState();
      expect(state.users[0].firstName).toBe('Johnny');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Set initial state with user
      useUserStore.setState({
        users: [mockUser],
        filteredUsers: [mockUser]
      });

      const mockResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      mockUserService.deleteUser.mockResolvedValue(mockResponse);

      const { deleteUser } = useUserStore.getState();
      const result = await deleteUser('1');

      expect(result).toBe(true);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1', mockToken);

      const state = useUserStore.getState();
      expect(state.users).toHaveLength(0);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Search completed',
        data: [mockUser]
      };

      mockUserService.searchUsers.mockResolvedValue(mockResponse);

      const { searchUsers } = useUserStore.getState();
      const result = await searchUsers('john');

      expect(result).toBe(true);
      expect(mockUserService.searchUsers).toHaveBeenCalledWith('john', mockToken);

      const state = useUserStore.getState();
      expect(state.users).toEqual([mockUser]);
      expect(state.searchQuery).toBe('john');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      const users = [
        { ...mockUser, id: '1', activeStatus: '1' as const },
        { ...mockUser, id: '2', activeStatus: '0' as const }
      ];
      
      useUserStore.setState({
        users,
        filteredUsers: users
      });
    });

    it('should filter active users', () => {
      const { setFilterStatus } = useUserStore.getState();
      setFilterStatus('active');

      const state = useUserStore.getState();
      expect(state.filteredUsers).toHaveLength(1);
      expect(state.filteredUsers[0].activeStatus).toBe('1');
    });

    it('should filter inactive users', () => {
      const { setFilterStatus } = useUserStore.getState();
      setFilterStatus('inactive');

      const state = useUserStore.getState();
      expect(state.filteredUsers).toHaveLength(1);
      expect(state.filteredUsers[0].activeStatus).toBe('0');
    });

    it('should show all users', () => {
      const { setFilterStatus } = useUserStore.getState();
      setFilterStatus('all');

      const state = useUserStore.getState();
      expect(state.filteredUsers).toHaveLength(2);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useUserStore.setState({ error: 'Some error' });

      const { clearError } = useUserStore.getState();
      clearError();

      const state = useUserStore.getState();
      expect(state.error).toBe(null);
    });
  });
});
