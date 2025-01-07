import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const LoginPage = ({ setToken, setUserId }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקת שדות ריקים
    if (!email || !password) {
      alert(t('login.emptyFields'));
      return;
    }

    try {
      // בקשת POST לשרת
      const response = await axios.post('http://localhost:5000/User/login', {
        email,
        password,
      });

      const { token, userId } = response.data;

      // שמירת הטוקן וה-ID ב-LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // עדכון ה-Token וה-UserId
      setToken(token);
      setUserId(userId);

      alert(t('login.success'));
    } catch (error) {
      // טיפול בשגיאות
      console.error('Login failed:', error.response?.data || error.message);

      // תצוגת שגיאה מתורגמת
      if (error.response?.status === 404) {
        alert(t('login.errors.userNotFound'));
      } else if (error.response?.status === 401) {
        alert(t('login.errors.invalidCredentials'));
      } else {
        alert(t('login.failed'));
      }
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
