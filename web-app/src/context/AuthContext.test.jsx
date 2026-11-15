import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { vi } from 'vitest';

global.fetch = vi.fn();

const TestComponent = () => {
  const { user, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="user-name">{user ? user.name : 'No User'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-name').textContent).toBe('No User');
  });

  it('should login successfully', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockResponse = {
      data: {
        user: mockUser,
        token: 'fake-token'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', expect.any(Object));
      expect(screen.getByTestId('user-name').textContent).toBe('Test User');
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('should handle login failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('No User');
    });
  });

  it('should logout successfully', async () => {
    // Setup initial state
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name').textContent).toBe('Test User');

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('user-name').textContent).toBe('No User');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
