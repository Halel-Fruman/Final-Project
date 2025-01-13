import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage/HomePage.js';
import ProductPage from './pages/ProductPage/ProductPage.js';
import LoginPage from './pages/PersonalArea/LoginPage.jsx';
import PersonalArea from './pages/PersonalArea/PersonalArea.jsx';
import CartPage from './pages/PersonalArea/CartPage.js';
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import SysAdmin from './pages/SysAdmin/SysAdmin.jsx';
// import StoreManagment from './pages/StoreManagment/StoreManagment.jsx';
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
          {/* <Route path='/loginAdmin' element={token ? <Navigate to="/AdminPage" /> : <LoginPage setToken={setToken} setAdminId={setAdminId} />} /> */}
          {/* <Route path='/SysAdmin' element={token ? <SysAdmin AdminId={AdminId} /> : <Navigate to="/loginAdmin" />} /> */}
          <Route path="/SysAdmin" element={<SysAdmin />} />

        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "./pages/HomePage/HomePage";
import ProductPage from "./pages/ProductPage/ProductPage";
import LoginPage from "./pages/PersonalArea/LoginPage.jsx";
import PersonalArea from "./pages/PersonalArea/PersonalArea.jsx";
import CartPage from "./pages/PersonalArea/CartPage.js";
import RegisterPage from "./pages/Registeration/RegisterPage.jsx";
import AddAddressPage from "./pages/Registeration/AddAddressPage.jsx";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

const App = () => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      const data = await response.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching wishlist:", error.message);
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToWishlist = async (product, isInWishlist) => {
    try {
      const method = isInWishlist ? "DELETE" : "POST";
      const response = await fetch(
        `http://localhost:5000/User/${userId}/wishlist`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
        );
      }

      await fetchWishlist(); // עדכן את ה-wishlist מיד לאחר הפעולה
    } catch (error) {
      console.error("Error updating wishlist:", error.message);
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setWishlistLoading(false);
    }
  }, [userId, token]);

  return (
    <Router>
      <Header onLogout={handleLogout} isLoggedIn={!!token} />
      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                addToWishlist={addToWishlist}
                wishlist={wishlist}
                wishlistLoading={wishlistLoading}
              />
            }
          />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" />
              ) : (
                <LoginPage setToken={setToken} setUserId={setUserId} />
              )
            }
          />
          <Route
            path="/register"
            element={<RegisterPage setToken={setToken} setUserId={setUserId} />}
          />
          <Route
            path="/personal-area"
            element={
              token ? (
                <PersonalArea userId={userId} wishlist={wishlist} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/cart"
            element={
              token ? <CartPage userId={userId} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/add-address"
            element={
              token ? (
                <AddAddressPage userId={userId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
