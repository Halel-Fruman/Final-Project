import React, { useEffect, useState } from 'react';

const PersonalArea = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUser();
  }, [userId]);


  return user ? (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Email: {user.email}</p>
      <h2>Your Cart</h2>
      {user.cart.map((item) => (
        <div key={item.productId}>
          <p>Product ID: {item.productId}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
      <h2>Your Wishlist</h2>
      {user.wishlist.map((item) => (
        <p key={item}>Product ID: {item}</p>
      ))}
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default PersonalArea;
