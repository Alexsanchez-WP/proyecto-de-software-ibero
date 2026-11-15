import React, { use, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount, cartItems } = useCart();
  const navigate = useNavigate();
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/catalogo" className="brand">
        ElectroShop
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && user.role !== 'admin' && (
          <>
            <Link to="/mis-ordenes" className="nav-link" style={{ color: '#333', textDecoration: 'none', marginRight: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
              <i className="fas fa-shopping-bag"></i>
              <span>Mis Ordenes</span>
            </Link>
            <div 
              className="cart-icon-container"
            data-testid="cart-container"
            onMouseEnter={() => setShowCartDropdown(true)}
            onMouseLeave={() => setShowCartDropdown(false)}
          >
            <Link to="/carrito" className="cart-link">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            
            {showCartDropdown && (
              <div className="cart-dropdown">
                <div className="cart-dropdown-header">
                  <strong>Tu Carrito ({cartCount})</strong>
                </div>
                <div className="cart-dropdown-items">
                  {cartItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="cart-dropdown-item">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <div className="more-items">...y {cartItems.length - 3} más</div>
                  )}
                  {cartItems.length === 0 && <div className="empty-cart-msg">Carrito vacío</div>}
                </div>
                <div className="cart-dropdown-actions">
                  <Link to="/carrito" className="view-cart-btn">Ver Carrito</Link>
                  <Link to="/confirmacion" className="checkout-btn">Finalizar Compra</Link>
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {user ? (
          <>
            <span style={{ color: '#333', fontSize: '0.9rem' }}>Hola, {user.username}</span>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--primary-blue)', fontWeight: '600', fontSize: '0.9rem' }}>
                Admin
              </Link>
            )}
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #dc3545',
                color: '#dc3545',
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: 'var(--primary-blue)', fontWeight: '600' }}>
            Ingresar
          </Link>
        )}
        <i className="fas fa-bars menu-toggle"></i>
      </div>
    </header>
  );
};

export default Header;
