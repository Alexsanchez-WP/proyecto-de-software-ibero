import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import API_URL from '../config';
import './AdminPage.css';

const AdminPage = () => {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: 10,
    brand: '',
    color: '',
    dimensions: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchProducts();
    } else if (view === 'orders') {
      fetchOrders();
    }
  }, [view]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Producto eliminado');
        fetchProducts();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      brand: product.brand,
      color: product.color || '',
      dimensions: product.dimensions || ''
    });
    setEditingId(product._id);
    setView('edit');
    setImageFiles([]);
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      stock: 10,
      brand: '',
      color: '',
      dimensions: ''
    });
    setEditingId(null);
    setView('create');
    setImageFiles([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      imageFiles.forEach(file => {
        data.append('images', file);
      });

      const url = editingId 
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (response.ok) {
        alert(editingId ? 'Producto actualizado' : 'Producto creado');
        fetchProducts();
        setView('list');
      } else {
        const resData = await response.json();
        alert(`Error: ${resData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    }
  };

  return (
    <Layout>
      <div className="container admin-container">
        <div className="admin-header">
          <h1>Administración</h1>
          <div className="admin-nav">
            <Button 
              variant={view === 'list' || view === 'create' || view === 'edit' ? 'primary' : 'outline'} 
              onClick={() => setView('list')}
            >
              Productos
            </Button>
            <Button 
              variant={view === 'orders' ? 'primary' : 'outline'} 
              onClick={() => setView('orders')}
              style={{ marginLeft: '10px' }}
            >
              Órdenes
            </Button>
          </div>
        </div>

        <div className="admin-subheader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{view === 'orders' ? 'Listado de Órdenes' : 'Listado de Productos'}</h2>
          {view === 'list' && (
            <Button onClick={handleCreateClick}>
              <i className="fas fa-plus"></i> Nuevo Producto
            </Button>
          )}
          {(view === 'create' || view === 'edit') && (
            <Button variant="outline" onClick={() => setView('list')}>
              <i className="fas fa-arrow-left"></i> Volver a la lista
            </Button>
          )}
        </div>

        {view === 'orders' ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>
                      {order.user ? (
                        <div>
                          <div>{order.user.username}</div>
                          <small>{order.user.email}</small>
                        </div>
                      ) : 'Usuario eliminado'}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</td>
                    <td>${order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.quantity}x {item.name}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay órdenes registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : view === 'list' ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`} 
                          alt={product.name} 
                          className="product-thumb"
                        />
                      ) : (
                        <div className="no-image">Sin img</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>${product.price.toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn edit-btn"
                          onClick={() => handleEditClick(product)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="icon-btn delete-btn"
                          onClick={() => handleDelete(product._id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card form-card">
            <h2>{view === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Producto</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Dimensiones</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Imágenes {view === 'edit' && '(Dejar vacío para mantener actuales)'}</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {view === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setView('list')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
