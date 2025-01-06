import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = ({ setToken, setUserId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const { token, userId } = response.data;

      // שמירת הטוקן והמשתמש ב-LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // עדכון הסטייט
      setToken(token);
      setUserId(userId);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
