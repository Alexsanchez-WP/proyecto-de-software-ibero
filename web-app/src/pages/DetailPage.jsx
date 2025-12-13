import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import './DetailPage.css';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        if (data.data.images && data.data.images.length > 0) {
          setSelectedImage(data.data.images[0]);
        } else if (data.data.image_url) {
          setSelectedImage(data.data.image_url);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
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
        body: JSON.stringify({ productId: id, quantity: 1 })
      });

      if (response.ok) {
        alert('Producto agregado al carrito');
        navigate('/carrito');
      } else {
        alert('Error al agregar al carrito');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Layout><div>Cargando...</div></Layout>;
  if (error || !product) return <Layout><div>Error: {error || 'Producto no encontrado'}</div></Layout>;

  const getImageUrl = (url) => {
    if (!url) return '/imagenes/default.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/catalogo">Catálogo</Link>
        <span>›</span>
        <span>{product.name}</span>
      </nav>

      <div className="detail-wrapper">
        <div className="detail-left">
          <div className="main-image-container">
            <img src={getImageUrl(selectedImage || images[0])} alt={product.name} className="main-image" />
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={getImageUrl(img)} alt={`${product.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-right">
          <div>
            <div className="product-header">
              <div className="dot"></div>
              <h2>{product.name}</h2>
            </div>
            <p className="price" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-blue)', margin: '1rem 0' }}>
              ${product.price.toLocaleString()}
            </p>
            
            <ul className="spec-list" style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <span className="label" style={{ fontWeight: 'bold' }}>Marca:</span> {product.brand || 'N/A'}
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <span className="label" style={{ fontWeight: 'bold' }}>Color:</span> {product.color || 'N/A'}
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <span className="label" style={{ fontWeight: 'bold' }}>Dimensiones:</span> {product.dimensions || 'N/A'}
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <span className="label" style={{ fontWeight: 'bold' }}>Stock:</span> {product.stock}
              </li>
            </ul>

            <p>{product.description}</p>
          </div>

          <div className="action-buttons">
            <Button
              className="btn-add"
              onClick={handleAddToCart}
            >
              Agregar al<br />carrito
            </Button>

            <Button
              className="btn-back"
              variant="light"
              onClick={() => navigate('/catalogo')}
            >
              Volver al catálogo
            </Button>
          </div>
        </div>
      </div>

      <section className="bottom-section">
        <h3>Descripción</h3>
        <p>{product.description}</p>
      </section>
    </Layout>
  );
};

export default DetailPage;
