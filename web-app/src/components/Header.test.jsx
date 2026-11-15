import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
const mockUseCart = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => mockUseCart()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render cart badge when user is logged in and cart has items', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test' }, logout: vi.fn() });
    mockUseCart.mockReturnValue({ cartCount: 5, cartItems: [] });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not render cart badge when cart is empty', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test' }, logout: vi.fn() });
    mockUseCart.mockReturnValue({ cartCount: 0, cartItems: [] });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('should show logout button when user is logged in and handle logout', () => {
    const logoutMock = vi.fn();
    mockUseAuth.mockReturnValue({ user: { name: 'Test' }, logout: logoutMock });
    mockUseCart.mockReturnValue({ cartCount: 0, cartItems: [] });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logoutBtn = screen.getByText('Salir');
    expect(logoutBtn).toBeInTheDocument();
    
    fireEvent.click(logoutBtn);
    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should show cart dropdown on hover', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test' }, logout: vi.fn() });
    mockUseCart.mockReturnValue({ 
      cartCount: 2, 
      cartItems: [
        { product: { name: 'Prod 1' }, quantity: 1 },
        { product: { name: 'Prod 2' }, quantity: 1 }
      ] 
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const container = screen.getByTestId('cart-container');
    
    fireEvent.mouseEnter(container);
    expect(screen.getByText('Tu Carrito (2)')).toBeInTheDocument();
    expect(screen.getByText('Prod 1')).toBeInTheDocument();
    
    fireEvent.mouseLeave(container);
    expect(screen.queryByText('Tu Carrito (2)')).not.toBeInTheDocument();
  });

  it('should show login link when user is not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseCart.mockReturnValue({ cartCount: 0, cartItems: [] });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });
});
