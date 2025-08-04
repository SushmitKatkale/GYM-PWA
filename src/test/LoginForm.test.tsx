import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../stores/authStore';

vi.mock('../stores/authStore');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the initial state of the auth store
const login = vi.fn();
mockUseAuthStore.mockReturnValue({
  login,
  isLoading: false,
  error: null,
  clearError: vi.fn(),
});

describe('LoginForm', () => {
  it('renders login form with email and password inputs', () => {
    render(<LoginForm onToggleMode={vi.fn()} />);

    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });


  it('handles login error from auth store', async () => {
    mockUseAuthStore.mockReturnValueOnce({
      login: vi.fn(),
      isLoading: false,
      error: 'Invalid credentials',
      clearError: vi.fn(),
    });

    render(<LoginForm onToggleMode={vi.fn()} />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls login method with email and password', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(true);
    
    // Mock the store for this specific test
    mockUseAuthStore.mockImplementation(() => ({
      login,
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    }));

    render(<LoginForm onToggleMode={vi.fn()} />);
    
    // Use data-testid or role-based selectors if placeholders are problematic
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    // Clear inputs and fill with test data
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'testpass');
    
    // Verify input values
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('testpass');
    
    // Submit the form
    await user.click(signInButton);

    // Check if login was called
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'testpass');
    }, { timeout: 3000 });
  });
});
