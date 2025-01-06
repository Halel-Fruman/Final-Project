import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = ({ setToken, setUserId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      console.log('Sending:', { email, password }); // הדפסה לפני שליחה
      const response = await axios.post('http://localhost:5000/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Response:', response.data);
      const { token, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      setToken(token);
      setUserId(userId);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };


  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // עדכון המשתנה email
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // עדכון המשתנה password
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );

};

export default LoginPage;
