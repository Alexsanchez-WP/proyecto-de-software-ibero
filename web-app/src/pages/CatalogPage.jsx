import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL from '../config';
import './CatalogPage.css';

const CatalogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        alert('Producto agregado al carrito');
        refreshCart(); 
      } else {
        alert('Error al agregar al carrito');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Layout><div>Cargando productos...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

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
      <h1>Catálogo</h1>

      <section className="product-grid">
        {products.map((product) => (
          <Card key={product._id} className="product-card">
            <img src={getImageUrl(product)} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">${product.price.toLocaleString()}</p>

            <div className="actions">
              <Button
                variant="primary"
                onClick={() => handleAddToCart(product._id)}
              >
                Agregar al carrito
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/detalle/${product._id}`)}
              >
                Ver más
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </Layout>
  );
};

export default CatalogPage;
