import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage/HomePage';
import ProductPage from './pages/ProductPage/ProductPage';
import LoginPage from './pages/PersonalArea/LoginPage.jsx';
import PersonalArea from './pages/PersonalArea/PersonalArea.jsx';
import CartPage from './pages/PersonalArea/CartPage.js';
import RegisterPage from './pages/Registeration/RegisterPage.jsx';
import AddAddressPage from './pages/Registeration/AddAddressPage.jsx';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

const App = () => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/personal-area" element={token ? <PersonalArea userId={userId} /> : <Navigate to="/login" />} />
          <Route path="/cart" element={token ? <CartPage userId={userId} /> : <Navigate to="/login" />} />
          <Route path="/add-address" element={token ? <AddAddressPage userId={userId} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
