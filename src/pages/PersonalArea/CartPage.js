import React, { useState, useEffect } from 'react';

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
    try {
      const updatedCart = cart.filter((item) => item.productId !== productId);
      const response = await fetch('http://localhost:5000/api/users/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, cart: updatedCart }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      setCart(updatedCart);
    } catch (err) {
      console.error(err.message);
    }
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
