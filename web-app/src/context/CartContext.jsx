import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_URL from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        const count = data.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
        setCartItems(data.data.items);
      } else {
        setCartCount(0);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart context:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const refreshCart = () => {
    fetchCart();
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
