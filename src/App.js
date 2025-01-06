import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage/HomePage';
import ProductPage from './pages/ProductPage/ProductPage';
import LoginPage from './pages/PersonalArea/LoginPage.jsx';
import PersonalArea from './pages/PersonalArea/PersonalArea.jsx';
import CartPage from './pages/PersonalArea/CartPage.js';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import RegisterPage from './pages/Registeration/RegisterPage.jsx';
import './App.css';
import '@fontsource/rubik';

const App = () => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    // Set direction (LTR or RTL) based on selected language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      <Header onLogout={handleLogout} isLoggedIn={!!token} />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={token ? <Navigate to="/personal-area" /> : <LoginPage setToken={setToken} setUserId={setUserId} />} />
          <Route path="/personal-area" element={token ? <PersonalArea userId={userId} /> : <Navigate to="/login" />} />
          <Route path="/cart" element={token ? <CartPage userId={userId} /> : <Navigate to="/login" />} />
          <Route path="/register" element={<RegisterPage />} />

        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
