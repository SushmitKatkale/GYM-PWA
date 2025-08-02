import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

// Mock the auth service
vi.mock('../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.login.mockResolvedValue({
        success: true,
        message: 'Login successful',
        data: mockTokens,
      });

      const { login } = useAuthStore.getState();
      const result = await login('test@example.com', 'password123');

      expect(result).toBe(true);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      const state = useAuthStore.getState();
      expect(state.tokens).toEqual(mockTokens);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle login failure', async () => {
      mockAuthService.login.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });

      const { login } = useAuthStore.getState();
      const result = await login('test@example.com', 'wrongpassword');

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
      expect(state.tokens).toBe(null);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        type: '1' as const,
      };

      mockAuthService.register.mockResolvedValue({
        success: true,
        message: 'Registration successful',
      });

      const { register } = useAuthStore.getState();
      const result = await register(registrationData);

      expect(result).toBe(true);
      expect(mockAuthService.register).toHaveBeenCalledWith(registrationData);

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle registration failure', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        type: '1' as const,
      };

      mockAuthService.register.mockResolvedValue({
        success: false,
        message: 'Email already exists',
      });

      const { register } = useAuthStore.getState();
      const result = await register(registrationData);

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout and clean up state', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          role: 'user',
          isVerified: true,
          activeStatus: '1',
          createTimestamp: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        isAuthenticated: true,
      });

      mockAuthService.logout.mockResolvedValue({
        success: true,
        message: 'Logged out successfully',
      });

      const { logout } = useAuthStore.getState();
      await logout();

      expect(mockAuthService.logout).toHaveBeenCalledWith('refresh-token');

      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      mockAuthService.sendOtp.mockResolvedValue({
        success: true,
        message: 'OTP sent successfully',
      });

      const { sendOtp } = useAuthStore.getState();
      const result = await sendOtp('test@example.com', 'John');

      expect(result).toBe(true);
      expect(mockAuthService.sendOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'John',
      });
    });

    it('should handle OTP sending failure', async () => {
      mockAuthService.sendOtp.mockResolvedValue({
        success: false,
        message: 'Failed to send OTP',
      });

      const { sendOtp } = useAuthStore.getState();
      const result = await sendOtp('test@example.com');

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Failed to send OTP');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({
        success: true,
        message: 'OTP verified successfully',
      });

      const { verifyOtp } = useAuthStore.getState();
      const result = await verifyOtp('test@example.com', '123456');

      expect(result).toBe(true);
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        otp: '123456',
      });
    });

    it('should handle invalid OTP', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({
        success: false,
        message: 'Invalid OTP',
      });

      const { verifyOtp } = useAuthStore.getState();
      const result = await verifyOtp('test@example.com', '000000');

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Invalid OTP');
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      useAuthStore.setState({
        user: {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          isVerified: true,
          activeStatus: '1',
          createTimestamp: new Date().toISOString(),
        },
      });

      const { hasRole } = useAuthStore.getState();
      expect(hasRole('admin')).toBe(true);
      expect(hasRole(['admin', 'owner'])).toBe(true);
    });

    it('should return false for non-matching role', () => {
      useAuthStore.setState({
        user: {
          id: '1',
          firstName: 'Regular',
          lastName: 'User',
          username: 'user',
          email: 'user@example.com',
          role: 'user',
          isVerified: true,
          activeStatus: '1',
          createTimestamp: new Date().toISOString(),
        },
      });

      const { hasRole } = useAuthStore.getState();
      expect(hasRole('admin')).toBe(false);
      expect(hasRole(['admin', 'owner'])).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      const { hasRole } = useAuthStore.getState();
      expect(hasRole('admin')).toBe(false);
    });
  });

  describe('validateSession', () => {
    it('should logout if authenticated but no tokens', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        tokens: null,
      });

      const { validateSession } = useAuthStore.getState();
      validateSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
