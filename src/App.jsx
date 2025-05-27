import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "react-hot-toast";
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
import Sidebar from "./pages/SysAdmin/Sidebar.jsx";
import Modal from "./components/Modal";
import LoginPage from "./pages/PersonalArea/LoginPage";
import RegisterPage from "./pages/Registeration/RegisterPage";
import StoreManagement from "./pages/StoreManagement/StoreManagement.jsx";
import WishlistModal from "./components/WishlistModal";
import CheckoutPage from "./pages/Checkout/Checkout";
import ConfirmationPage from "./pages/Checkout/ComfirmationPage.jsx";
import ChatBot from "./components/chatbotFolder/ChatBotFile.jsx"; // 
import { useNavigate } from "react-router-dom";
import NotFound from "./pages/Errors/NotFound.jsx";
import ServiceUnavailablePage from "./pages/Errors/Service.jsx";
import { fetchWithTokenRefresh } from "./utils/authHelpers";

const App = () => {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setCartItems([]);
    setToken(null);
    setUserId(null);
    setRole(null);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUserRole = localStorage.getItem("role");

      if (!storedUserId || !localStorage.getItem("refreshToken")) {
        handleLogout();
        return;
      }

      try {
        const res = await fetchWithTokenRefresh("/api/User/verify-token");
        if (res.ok) {
          const accessToken = localStorage.getItem("accessToken");
          setToken(accessToken);
          setUserId(storedUserId);
          setRole(storedUserRole);
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        handleLogout();
      }
    };

    verifyToken();
  }, []);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);
  const handleOpenWishlist = () => setIsWishlistOpen(true);
  const handleCloseWishlist = () => setIsWishlistOpen(false);
  

const handleOpenAddProductForm = () =>
  window.dispatchEvent(new CustomEvent("openAddProductForm"));

const handleCreateDiscount = () =>
  window.dispatchEvent(new CustomEvent("createDiscount"));

const handleSendNewsletter = () =>
  window.dispatchEvent(new CustomEvent("sendNewsletter"));
 


  const loadCart = useCallback(async () => {
    if (userId && token) {
      const data = await fetchCart(userId, token);
      setCartItems(data);
    }
  }, [userId, token]);

  const handleRemoveFromCart = async (productId) => {
    const updatedCart = await removeFromCart(userId, token, productId);
    if (updatedCart) setCartItems(updatedCart);
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
    if (token && userId) {
      loadCart();
      loadWishlist();
    }
  }, [token, userId, loadWishlist, loadCart]);

  const addToWishlist = async (product, isInWishlist) => {
    const success = await updateWishlist(userId, token, product, isInWishlist);
    if (success) {
      toast.success(
        isInWishlist
          ? t("wishlist.removed") + " ❌"
          : t("wishlist.added") + " ✅"
      );
      loadWishlist();
    }
  };

  return (
    <AlertProvider>
      <Router basename="/shop">
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
        <div className="flex flex-col bg-gray-50 max-w-[1920px] justify-self-center min-h-screen">
          <Header
            onLoginClick={() => setIsLoginModalOpen(true)}
            onRegisterClick={() => setIsRegisterModalOpen(true)}
            onCartClick={handleOpenCart}
            cartItems={cartItems}
            wishlist={wishlist}
            onWishlistClick={handleOpenWishlist}
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
            userId={userId}
          />

          <WishlistModal
            isOpen={isWishlistOpen}
            onClose={handleCloseWishlist}
            wishlist={wishlist}
            fetchProductDetails={fetchProductDetails}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={(product) => addToWishlist(product, true)}
          />

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

        {/*Modal component to display the register modal */}
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}>
          <RegisterPage
            setToken={setToken}
            setUserId={setUserId}
            onClose={() => setIsRegisterModalOpen(false)}
          />
        </Modal>
        {/*div element to wrap the content of the application */}
        <div className="app-content">
          {/*Routes component to define the routes of the application */}
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
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  fetchProductDetails={fetchProductDetails}
                  userId={userId}
                  token={token}
                />
              }
            />
            <Route path="/confirmation" element={<ConfirmationPage />} />

            <Route
              path="/SysAdmin"
              // check if the user is logged in and has the role of admin
              element={
                token && role === "admin" ? (
                  <Sidebar token={token} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/store-management"
              // check if the user is logged in and has the role of storeManager
              element={
               token && (role === "storeManager" || role === "admin")
 ? (
                  <StoreManagement />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/store-management/:storeId"
              element={
                token && role === "admin" ? (
                  <StoreManagement />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/personal-area"
              // check if the user is logged in
              element={
                token ? (
                  <PersonalArea
                    userId={userId}
                    addToWishlist={addToWishlist}
                    addToCart={handleAddToCart}
                    token={token}
                  />

                }
              />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route
                path="/SysAdmin"
                element={
                  token && role === "admin" ? (
                    <Sidebar token={token} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/store-management"
                element={
                  token && (role === "storeManager" || role === "admin") ? (
                    <StoreManagement />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/store-management/:storeId"
                element={
                  token && role === "admin" ? (
                    <StoreManagement />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/personal-area"
                element={
                  token ? (
                    <PersonalArea
                      userId={userId}
                      addToWishlist={addToWishlist}
                      addToCart={handleAddToCart}
                      token={token}
                    />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
 <ChatBot
          token={token}
          userId={userId}
          onOpenCart={handleOpenCart}
          onOpenWishlist={handleOpenWishlist}
          onLogout={handleLogout}
         onOpenAddProductForm={handleOpenAddProductForm}
          onCreateDiscount={handleCreateDiscount}
          onSendNewsletter={handleSendNewsletter}
       />

              <Route path="/503" element={<ServiceUnavailablePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    
    </AlertProvider>
  );
};


export default App;
