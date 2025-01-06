import React, { useEffect, useState } from 'react';

const PersonalArea = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/User/${userId}`);
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
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Personal Area</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <h3>Your Cart</h3>
        {user.cart.length > 0 ? (
          <ul className="list-group">
            {user.cart.map((item, index) => (
              <li key={index} className="list-group-item">
                Product ID: {item.productId}, Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}

        <h3 className="mt-4">Your Wishlist</h3>
        {user.wishlist.length > 0 ? (
          <ul className="list-group">
            {user.wishlist.map((item, index) => (
              <li key={index} className="list-group-item">Product ID: {item}</li>
            ))}
          </ul>
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default PersonalArea;
