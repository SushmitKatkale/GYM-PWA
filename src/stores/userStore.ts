import { create } from 'zustand';
import { userService, User, CreateUserRequest, UpdateUserRequest } from '../services/userService';
import { useAuthStore } from './authStore';

interface UserState {
  users: User[];
  filteredUsers: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'inactive';
  
  // Actions
  fetchUsers: (page?: number, limit?: number) => Promise<boolean>;
  searchUsers: (query: string) => Promise<boolean>;
  createUser: (userData: CreateUserRequest) => Promise<boolean>;
  updateUser: (id: string, userData: UpdateUserRequest) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'active' | 'inactive') => void;
  applyFilters: () => void;
  clearError: () => void;
  resetState: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  filteredUsers: [],
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  isLoading: false,
  error: null,
  searchQuery: '',
  filterStatus: 'all',

  fetchUsers: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await userService.getAllUsers(token, page, limit);
      
      if (response.success && response.data) {
        set({
          users: response.data.users,
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalUsers: response.data.totalUsers,
          isLoading: false
        });
        
        // Apply current filters
        get().applyFilters();
        return true;
      } else {
        set({
          error: response.message || 'Failed to fetch users',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      get().applyFilters();
      return true;
    }

    set({ isLoading: true, error: null, searchQuery: query });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await userService.searchUsers(query, token);
      
      if (response.success && response.data) {
        set({
          users: response.data,
          isLoading: false
        });
        
        // Apply current filters to search results
        get().applyFilters();
        return true;
      } else {
        set({
          error: response.message || 'Search failed',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Search users error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  createUser: async (userData: CreateUserRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await userService.createUser(userData, token);
      
      if (response.success && response.data) {
        // Refresh the users list
        await get().fetchUsers(get().currentPage);
        return true;
      } else {
        set({
          error: response.message || 'Failed to create user',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Create user error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  updateUser: async (id: string, userData: UpdateUserRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await userService.updateUser(id, userData, token);
      
      if (response.success && response.data) {
        // Update the user in the local state
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, ...response.data } : user
          ),
          isLoading: false
        }));
        
        // Apply current filters
        get().applyFilters();
        return true;
      } else {
        set({
          error: response.message || 'Failed to update user',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await userService.deleteUser(id, token);
      
      if (response.success) {
        // Remove the user from local state
        set(state => ({
          users: state.users.filter(user => user.id !== id),
          isLoading: false
        }));
        
        // Apply current filters
        get().applyFilters();
        return true;
      } else {
        set({
          error: response.message || 'Failed to delete user',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Delete user error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      get().applyFilters();
    }
  },

  setFilterStatus: (status: 'all' | 'active' | 'inactive') => {
    set({ filterStatus: status });
    get().applyFilters();
  },

  applyFilters: () => {
    const { users, searchQuery, filterStatus } = get();
    
    let filtered = users;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(user => 
        user.activeStatus === (isActive ? '1' : '0')
      );
    }
    
    set({ filteredUsers: filtered });
  },

  clearError: () => set({ error: null }),

  resetState: () => set({
    users: [],
    filteredUsers: [],
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    isLoading: false,
    error: null,
    searchQuery: '',
    filterStatus: 'all'
  })
}));
