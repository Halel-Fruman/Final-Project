import React, { useEffect, useState, useCallback } from "react";
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
import SysAdmin from "./pages/SysAdmin/SysAdmin.jsx";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

const App = () => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // מתאימה את כיוון השפה
  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  // פונקציית יציאה
  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  // פונקציית טעינת Wishlist
  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      if (!userId || !token) {
        setWishlist([]);
        setWishlistLoading(false);
        return;
      }

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
  }, [userId, token]);

  // הוספה או הסרה מ-Wishlist
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

      await fetchWishlist(); // עדכון הרשימה לאחר שינוי
    } catch (error) {
      console.error("Error updating wishlist:", error.message);
    }
  };

  // טוען את ה-Wishlist לאחר התחברות המשתמש
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

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
          <Route
            path="/product/:id"
            element={
              <ProductPage addToWishlist={addToWishlist} wishlist={wishlist} />
            }
          />
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
          <Route path="/SysAdmin" element={<SysAdmin />} />
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
