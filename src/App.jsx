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
import StoreManagement from './pages/StoreManagement/StoreManagement.jsx'
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { fetchWishlist, updateWishlist } from "./utils/Wishlist"; // ייבוא הפונקציות
import { AlertProvider } from './components/AlertDialog.jsx';



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

  // פונקציית טעינת Wishlist
  const loadWishlist = useCallback(async () => {
    setWishlistLoading(true);
    if (!userId || !token) {
      setWishlist([]);
      setWishlistLoading(false);
      return;
    }

    const data = await fetchWishlist(userId, token);
    setWishlist(data);
    setWishlistLoading(false);
  }, [userId, token]);

  // פונקציית עדכון Wishlist
  const addToWishlist = async (product, isInWishlist) => {
    const success = await updateWishlist(userId, token, product, isInWishlist);
    if (success) {
      loadWishlist(); // עדכון הרשימה לאחר השינוי
    }
  };

  // טוען את ה-Wishlist לאחר התחברות המשתמש
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return (
    <Router>
      <Header onLogout={() => setToken(null)} isLoggedIn={!!token} />
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
          <Route path="/store-management" element={<StoreManagement />} />

          <Route
            path="/personal-area"
            element={
              token ? (
                <PersonalArea
                  userId={userId}
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                />
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
