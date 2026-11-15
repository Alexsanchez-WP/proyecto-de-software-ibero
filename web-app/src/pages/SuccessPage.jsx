import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import API_URL from '../config';
import './SuccessPage.css';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentId) {
      finalizeOrder();
    } else {
      setError('No payment ID found');
      setLoading(false);
    }
  }, [paymentId]);

  const finalizeOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: paymentId })
      });
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        refreshCart(); 
      } else {
        setError(data.message || 'Error finalizing order');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Procesando pago...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="success-container">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu compra ha sido confirmada.</p>

        <div className="pickup-card">
          <h2>Código de Retiro</h2>
          <div className="pin-code">{order.pickupCode}</div>
          
          <div className="qr-container">
            <img src={order.qrCodeData} alt="QR Code" />
          </div>
          
          <p className="instruction">
            Presenta este código QR o el PIN en la tienda para retirar tus productos.
          </p>
        </div>

        <Button onClick={() => navigate('/catalogo')}>Volver al Catálogo</Button>
      </div>
    </Layout>
  );
};

export default SuccessPage;
