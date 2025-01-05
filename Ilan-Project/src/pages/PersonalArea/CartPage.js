import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CartPage = ({ userId }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchCart();
  }, [userId]);


  const handleRemove = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    await axios.put('http://localhost:5000/api/users/cart', { userId, cart: updatedCart });
    setCart(updatedCart);
  };

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.map((item) => (
        <div key={item.productId}>
          <p>Product ID: {item.productId}</p>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => handleRemove(item.productId)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
