import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuthStore } from '../stores/authStore';

vi.mock('../stores/authStore');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the initial state of the auth store
const register = vi.fn();
mockUseAuthStore.mockReturnValue({
  register,
  isLoading: false,
  error: null,
  clearError: vi.fn(),
});

describe('RegisterForm', () => {
  it('renders registration form with all inputs', () => {
    render(<RegisterForm onToggleMode={vi.fn()} />);

    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1234567890')).toBeInTheDocument();
  });

  it('handles registration error from auth store', async () => {
    mockUseAuthStore.mockReturnValueOnce({
      register: vi.fn(),
      isLoading: false,
      error: 'Registration failed',
      clearError: vi.fn(),
    });

    render(<RegisterForm onToggleMode={vi.fn()} />);

    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('validates password and confirmPassword match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onToggleMode={vi.fn()} />);

    // Fill in required fields to make form valid except for password mismatch
    const firstNameInput = screen.getByPlaceholderText('John');
    const lastNameInput = screen.getByPlaceholderText('Doe');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const passwordInput = screen.getByPlaceholderText('Minimum 6 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(usernameInput, 'johndoe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'wrongpassword');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls register method with correct data', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue(true);
    
    // Mock the store for this specific test
    mockUseAuthStore.mockImplementation(() => ({
      register,
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    }));

    render(<RegisterForm onToggleMode={vi.fn()} />);

    // Fill in all form fields
    const firstNameInput = screen.getByPlaceholderText('John');
    const lastNameInput = screen.getByPlaceholderText('Doe');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const phoneInput = screen.getByPlaceholderText('+1234567890');
    const passwordInput = screen.getByPlaceholderText('Minimum 6 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    await user.clear(firstNameInput);
    await user.clear(lastNameInput);
    await user.clear(usernameInput);
    await user.clear(emailInput);
    await user.clear(phoneInput);
    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);

    await user.type(firstNameInput, 'TestFirst');
    await user.type(lastNameInput, 'TestLast');
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@test.com');
    await user.type(phoneInput, '1234567890');
    await user.type(passwordInput, 'testpass123');
    await user.type(confirmPasswordInput, 'testpass123');

    // Verify input values
    expect(firstNameInput.value).toBe('TestFirst');
    expect(lastNameInput.value).toBe('TestLast');
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@test.com');
    expect(phoneInput.value).toBe('1234567890');
    expect(passwordInput.value).toBe('testpass123');
    expect(confirmPasswordInput.value).toBe('testpass123');

    await user.click(submitButton);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        firstName: 'TestFirst',
        lastName: 'TestLast',
        username: 'testuser',
        email: 'test@test.com',
        password: 'testpass123',
        phoneNumber: '1234567890',
        type: '1',
      });
    }, { timeout: 3000 });
  });
});
