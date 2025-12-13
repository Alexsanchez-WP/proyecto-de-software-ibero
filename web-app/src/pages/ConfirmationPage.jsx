import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL from '../config';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (response.ok) {
        fetchCart();
        refreshCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  if (loading) return <Layout><div>Cargando confirmación...</div></Layout>;
  if (!user) return <Layout><div>Por favor inicia sesión</div></Layout>;

  const cartItems = cart?.items || [];
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/catalogo">Catálogo</Link>
        <span>›</span>
        <Link to="/carrito">Carrito</Link>
        <span>›</span>
        <span>Confirmación</span>
      </nav>

      <h2>Resumen de Compra</h2>
      <div className="confirm-card">
        <div className="dot"></div>
        <div>
          <h3>Revisa tu pedido</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Por favor verifica los productos y tus datos antes de finalizar la compra.
          </p>
        </div>
      </div>

      <h3>Productos a adquirir</h3>
      <table className="summary-table">
        <tbody>
          {cartItems.map((item) => (
            <tr key={item._id}>
              <th>{item.product.name}</th>
              <td>
                <div className="quantity-control">
                  <button 
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>${(item.product.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="total-row">
            <th>Total</th>
            <td></td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <h3>Datos de contacto</h3>
      <table className="info-table">
        <tbody>
          <tr>
            <th>Usuario</th>
            <td>{user.username}</td>
          </tr>
          <tr>
            <th>Correo</th>
            <td>{user.email}</td>
          </tr>
        </tbody>
      </table>

      <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="primary"
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${API_URL}/api/orders/checkout`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const data = await response.json();
              if (data.success && data.data.url) {
                window.location.href = data.data.url;
              } else {
                alert('Error al iniciar el pago');
              }
            } catch (error) {
              console.error(error);
              alert('Error de red');
            }
          }}
        >
          Confirmar y Pagar
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/carrito')}
        >
          Volver al Carrito
        </Button>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿Necesitas ayuda? Contáctanos para soporte.
      </p>
    </Layout>
  );
};

export default ConfirmationPage;
