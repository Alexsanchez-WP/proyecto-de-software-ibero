import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Sort orders by date (newest first) if not already sorted
        const sortedOrders = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrders);
      } else {
        setError('No se pudieron cargar las órdenes');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Cargando órdenes...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="orders-container">
        <h1 className="orders-title">Mis Órdenes</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No tienes órdenes registradas aún.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Orden #{order._id.slice(-6)}</span>
                    <div className="order-date">
                      {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className={`order-status status-${order.status}`}>
                    {order.status === 'paid' ? 'Pagado' : order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="pickup-info">
                    {order.pickupCode && (
                      <div className="pickup-code">
                        <strong>Código de retiro:</strong> {order.pickupCode}
                      </div>
                    )}
                  </div>
                  <div className="total-section">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                {order.qrCodeData && (
                  <div className="qr-code-section" style={{marginTop: '1rem', textAlign: 'center'}}>
                    <p style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Código QR para retiro:</p>
                    <img src={order.qrCodeData} alt="QR Code" style={{width: '120px'}} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
