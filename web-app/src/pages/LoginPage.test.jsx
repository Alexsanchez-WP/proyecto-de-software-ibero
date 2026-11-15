import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../components/Button', () => ({
  default: ({ children, onClick, type }) => (
    <button onClick={onClick} type={type}>{children}</button>
  )
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Nombre de usuario')).not.toBeInTheDocument();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });

  it('should switch to register form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));

    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ role: 'user' }));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
    
    fireEvent.click(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password');
      expect(mockNavigate).toHaveBeenCalledWith('/catalogo');
    });
  });

  it('should handle login error', async () => {
    mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
    
    fireEvent.click(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
