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
import PersonalArea from "./pages/PersonalArea/PersonalArea.jsx";
import CartModal from "./components/CartModal";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  fetchProductDetails,
} from "./utils/Cart";
import { fetchWishlist, updateWishlist } from "./utils/Wishlist";
import { AlertProvider } from "./components/AlertDialog.jsx";
import Sidebar from "./pages/SysAdmin/Sidebar.jsx"; // ייבוא Sidebar
import Modal from "./components/Modal"; // ייבוא רכיב המודאל
import LoginPage from "./pages/PersonalArea/LoginPage";
import RegisterPage from "./pages/Registeration/RegisterPage";
import AddAddressPage from "./pages/Registeration/AddAddressPage.jsx"; // ייבוא AddAddressPage
import StoreManagement from "./pages/StoreManagement/StoreManagement.jsx"; // ייבוא StoreManagement

const App = () => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    setToken(null);
    setUserId(null);
    setRole(null);
  };

  const verifyToken = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserRole = localStorage.getItem("role");

    if (storedToken && storedUserId) {
      try {
        const response = await fetch(
          "http://localhost:5000/User/verify-token",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.ok) {
          setToken(storedToken);
          setUserId(storedUserId);
          setRole(storedUserRole);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        handleLogout();
      }
    }
  };
  useEffect(() => {
    verifyToken();
  }, []);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  const loadCart = useCallback(async () => {
    if (userId && token) {
      const data = await fetchCart(userId, token);
      setCartItems(data);
    }
  }, [userId, token]);

  const handleRemoveFromCart = async (productId) => {
    const updatedCart = await removeFromCart(userId, token, productId);
    if (updatedCart) {
      setCartItems(updatedCart);
    }
  };

  const handleAddToCart = async (product) => {
    const updatedCart = await addToCart(userId, token, product);
    if (updatedCart) {
      setCartItems(updatedCart);
      loadCart();
    }
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

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

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    if (token && userId) {
      loadCart();
      loadWishlist();
    }
  }, [token, userId, loadWishlist, loadCart]);

  const addToWishlist = async (product, isInWishlist) => {
    const success = await updateWishlist(userId, token, product, isInWishlist);
    if (success) {
      loadWishlist();
    }
  };

  return (
    <AlertProvider>
      <Router>
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onRegisterClick={() => setIsRegisterModalOpen(true)}
          onCartClick={handleOpenCart}
          cartItems={cartItems}
          setToken={setToken}
          setUserId={setUserId}
          setUserRole={setRole}
          onLogout={handleLogout}
          isLoggedIn={!!token}
          role={role}
        />
        <CartModal
          isOpen={isCartOpen}
          onClose={handleCloseCart}
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          fetchProductDetails={fetchProductDetails}
        />

        {/* Modals */}
        <Modal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}>
          <LoginPage
            setToken={setToken}
            setUserId={setUserId}
            setUserRole={setRole}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </Modal>
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}>
          <RegisterPage
            setToken={setToken}
            setUserId={setUserId}
            onClose={() => setIsRegisterModalOpen(false)}
          />
        </Modal>

        <div className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  wishlistLoading={wishlistLoading}
                  addToCart={handleAddToCart}
                />
              }
            />
            <Route
              path="/Products/:id"
              element={
                <ProductPage
                  addToWishlist={addToWishlist}
                  wishlist={wishlist}
                  addToCart={handleAddToCart}
                />
              }
            />
            <Route
              path="/SysAdmin"
              element={
                token ? (
                  <Navigate to="/" />
                ) : (
                  <LoginPage setToken={setToken} setUserId={setUserId} setUserRole={setRole} />
                )
              }
            />
            <Route
              path="/register"
              element={<RegisterPage setToken={setToken} setUserId={setUserId} />}
            />
            <Route path="/SysAdmin" element={token && (role === 'admin') ?
              (<Sidebar
                token={token}
              />
              ) : (<Navigate to="/login" />)} />
            <Route path="/store-management" element={token && (role === 'storeManager') ?
              (<StoreManagement />) : (<Navigate to="/login" />)} />

            <Route
              path="/personal-area"
              element={
                token ? (
                  <PersonalArea
                    userId={userId}
                    addToWishlist={addToWishlist}
                    wishlist={wishlist}
                    token={token}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/add-address"
              element={
                token ? (
                  <AddAddressPage userId={userId} token={token} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AlertProvider>
  );
};

export default App;
