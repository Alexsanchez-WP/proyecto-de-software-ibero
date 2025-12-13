import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL from '../config';
import './CartPage.css';

const CartPage = () => {
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

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchCart();
        refreshCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) return <Layout><div>Cargando carrito...</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Debes iniciar sesión para ver tu carrito</h2>
          <Button onClick={() => navigate('/login')}>Ir al Login</Button>
        </div>
      </Layout>
    );
  }

  const cartItems = cart?.items || [];
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const getImageUrl = (product) => {
    let url = '/imagenes/default.png';
    if (product.images && product.images.length > 0) {
      url = product.images[0];
    } else if (product.image_url) {
      url = product.image_url;
    }
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/catalogo">Catálogo</Link>
        <span>›</span>
        <span>Carrito</span>
      </nav>

      <section className="cart-top">
        <div className="card-pill">
          <div className="flex">
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--primary-blue)',
              }}
            ></div>
            <h3 style={{ margin: 0 }}>Carrito de compras</h3>
          </div>
          <span style={{ fontSize: '0.9rem' }}>{cartItems.length} productos agregados</span>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Tu carrito está vacío</p>
            <Button onClick={() => navigate('/catalogo')}>Ir al catálogo</Button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="card-pill" style={{ marginTop: '1rem' }}>
              <div className="flex">
                <img 
                  src={getImageUrl(item.product)} 
                  alt={item.product.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <h3 style={{ margin: 0 }}>{item.product.name}</h3>
                  <span style={{ fontSize: '0.9rem' }}>
                    Cantidad: {item.quantity}<br />
                    Precio Unitario: ${item.product.price.toLocaleString()}<br />
                    Subtotal: ${(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                onClick={() => handleRemove(item.product._id)}
              >
                Eliminar
              </Button>
            </div>
          ))
        )}

        {cartItems.length > 0 && (
          <div className="card-pill" style={{ marginTop: '1rem', background: '#f8f9fa' }}>
             <h3>Total: ${total.toLocaleString()}</h3>
             <div className="flex" style={{ gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                variant="primary"
                style={{ padding: '0.4rem 0.8rem' }}
                onClick={() => navigate('/confirmacion')}
              >
                Finalizar compra
              </Button>

              <Button
                variant="light"
                style={{ padding: '0.4rem 0.8rem' }}
                onClick={() => navigate('/catalogo')}
              >
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default CartPage;
