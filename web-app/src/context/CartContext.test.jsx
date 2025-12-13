import { render, screen, waitFor, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { AuthProvider } from './AuthContext';
import { vi } from 'vitest';

const mockUser = { id: 'user123', name: 'Test User' };
const mockUseAuth = vi.fn(() => ({ user: mockUser }));

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual('./AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }) => <div>{children}</div>
  };
});

global.fetch = vi.fn();

const TestComponent = () => {
  const { cartCount, cartItems } = useCart();
  return (
    <div>
      <span data-testid="cart-count">{cartCount}</span>
      <span data-testid="cart-items-length">{cartItems.length}</span>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    mockUseAuth.mockReturnValue({ user: mockUser });
  });

  it('should fetch cart data when user is logged in', async () => {
    const mockCartData = {
      success: true,
      data: {
        items: [
          { product: 'prod1', quantity: 2 },
          { product: 'prod2', quantity: 1 }
        ]
      }
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockCartData
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cart', expect.any(Object));
      expect(screen.getByTestId('cart-count').textContent).toBe('3');
      expect(screen.getByTestId('cart-items-length').textContent).toBe('2');
    });
  });

  it('should set cart to empty if no user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
    });
  });
});
