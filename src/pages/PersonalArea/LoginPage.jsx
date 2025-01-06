import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const LoginPage = ({ setToken, setUserId }) => {
  const { t } = useTranslation(); // שימוש בתרגום
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, userId } = response.data;

      // שמירת הטוקן והמשתמש ב-LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // עדכון הסטייט
      setToken(token);
      setUserId(userId);
      alert(t('login.success')); // הודעת הצלחה מתורגמת
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      alert(t('login.failed')); // הודעת שגיאה מתורגמת
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>{t('login.title')}</h1>
        <div className="form-group">
          <label htmlFor="email">{t('login.email')}</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('login.password')}</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {t('login.submit')}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
