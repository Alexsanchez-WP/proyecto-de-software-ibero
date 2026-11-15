import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/catalogo');
        }
      } else {
        setError(result.message);
      }
    } else {
      const result = await register(formData.username, formData.email, formData.password);
      if (result.success) {
        setIsLogin(true);
        setError('Registration successful! Please login.');
        setFormData({ ...formData, password: '' });
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-img">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
            alt="Cafe"
          />
        </div>

        <div className="login-form">
          <h2>{isLogin ? 'Login inicio' : 'Registro'}</h2>

          <div className="form-box">
            <div className="card-header">{isLogin ? 'Acceso' : 'Crear Cuenta'}</div>

            {!isLogin && (
              <div className="input-group">
                <input 
                  type="text" 
                  name="username"
                  placeholder="Nombre de usuario" 
                  value={formData.username}
                  onChange={handleChange}
                />
                <i className="fas fa-user"></i>
              </div>
            )}

            <div className="input-group">
              <input 
                type="email" 
                name="email"
                placeholder="Correo electrónico" 
                value={formData.email}
                onChange={handleChange}
              />
              <i className="fas fa-envelope"></i>
            </div>

            <div className="input-group">
              <input 
                type="password" 
                name="password"
                placeholder="Contraseña" 
                value={formData.password}
                onChange={handleChange}
              />
              <i className="fas fa-lock"></i>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="actions">
              <Button onClick={handleSubmit}>
                {isLogin ? 'Ingresar' : 'Registrarse'}
              </Button>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span 
                style={{ cursor: 'pointer', color: '#007bff' }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
              </span>
            </div>
          </div>
          
          <footer style={{ marginTop: '2rem' }}>
            © 2024 ElectroShop. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
