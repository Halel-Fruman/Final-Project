/**
 * @file App.jsx
 * @description Main application component that sets up routing, state management, and lazy loading of components
 * Handles user authentication, cart, and wishlist functionality.
 * @authors @Halel-Fruman & @danielBenTov26
 */

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "react-hot-toast";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  fetchProductDetails,
} from "./utils/Cart";
import { fetchWishlist, updateWishlist } from "./utils/Wishlist";
import { AlertProvider } from "./components/AlertDialog.jsx";
import { fetchWithTokenRefresh } from "./utils/authHelpers";
import ChatBot from "./components/chatbotFolder/ChatBotFile.jsx";
import { useNavigate } from "react-router-dom";

// Lazy load components to improve initial load time
const Header = lazy(() => import("./components/Header/Header"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const CartModal = lazy(() => import("./components/CartModal"));
const WishlistModal = lazy(() => import("./components/WishlistModal"));
const Modal = lazy(() => import("./components/Modal"));
const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const ProductPage = lazy(() => import("./pages/ProductPage/ProductPage"));
const PersonalArea = lazy(() =>
  import("./pages/PersonalArea/PersonalArea.jsx")
);
const CheckoutPage = lazy(() => import("./pages/Checkout/Checkout"));
const ConfirmationPage = lazy(() =>
  import("./pages/Checkout/ComfirmationPage.jsx")
);
const Sidebar = lazy(() => import("./pages/SysAdmin/Sidebar.jsx"));
const StoreManagement = lazy(() =>
  import("./pages/StoreManagement/StoreManagement.jsx")
);
const ForgotPassword = lazy(() =>
  import("./pages/Registeration/ForgotPassword.jsx")
);
const ResetPassword = lazy(() =>
  import("./pages/Registeration/ResetPassword.jsx")
);
const VerifyEmailPage = lazy(() =>
  import("./pages/Registeration/VerifyEmailPage.jsx")
);
const LoginPage = lazy(() => import("./pages/PersonalArea/LoginPage"));
const RegisterPage = lazy(() => import("./pages/Registeration/RegisterPage"));
const NotFound = lazy(() => import("./pages/Errors/NotFound.jsx"));
const ServiceUnavailablePage = lazy(() => import("./pages/Errors/Service.jsx"));

/**
 *
 * @function App
 * @description Main application component that sets up routing, state management, and lazy loading of components
 * Handles user authentication, cart, and wishlist functionality.
 * @returns {JSX.Element} The main application component
 */
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

  // Function to handle logout and clear local storage
  const handleLogout = () => {
    localStorage.clear();
    setCartItems([]);
    setToken(null);
    setUserId(null);
    setRole(null);
  };

  // Verify token on initial load
  // and set userId and role from local storage

  useEffect(() => {
    const verifyToken = async () => {
      // Check if accessToken and userId are available in localStorage
      // If not, redirect to login or handle logout
      let accessToken = localStorage.getItem("accessToken");
      const storedUserId = localStorage.getItem("userId");
      const storedUserRole = localStorage.getItem("role");
      if (!storedUserId || !localStorage.getItem("refreshToken")) {
        handleLogout();
        return;
      }
      // If accessToken is not available, try to refresh it
      try {
        const res = await fetchWithTokenRefresh("/api/User/verify-token");
        // If the response is ok, set the token, userId, and role from localStorage
        if (res.ok) {
          setToken(localStorage.getItem("accessToken"));
          setUserId(storedUserId);
          setRole(storedUserRole);
        }
        // If the response is not ok, handle logout
        else {
          handleLogout();
        }
      } catch {
        // If there is an error (e.g., network error, server error), handle logout
        handleLogout();
      }
    };
    // Call the verifyToken function to check the token validity
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

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Load cart items when userId and token are available
  const loadCart = useCallback(async () => {
    if (userId && token) {
      const data = await fetchCart(userId, token);
      setCartItems(data);
    }
  }, [userId, token]);

  // Handle removing item from cart
  // This function is called when the user clicks the remove button in the cart modal
  const handleRemoveFromCart = async (productId) => {
    const updatedCart = await removeFromCart(userId, token, productId);
    if (updatedCart) setCartItems(updatedCart);
  };
  // Handle adding item to cart
  // This function is called when the user clicks the add to cart button in the product page
  const handleAddToCart = async (product) => {
    const updatedCart = await addToCart(userId, token, product);
    if (updatedCart) {
      setCartItems(updatedCart);
      loadCart();
    }
  };

  // Load wishlist items when userId and token are available
  // This function fetches the wishlist from the server and updates the state
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

  // Load cart and wishlist on initial load or when token/userId changes
  // This effect runs when the component mounts or when the token or userId changes
  // It checks if the user is logged in (token and userId are available) and fetches the cart and wishlist
  useEffect(() => {
    if (token && userId) {
      loadCart();
      loadWishlist();
    }
  }, [token, userId, loadWishlist, loadCart]);

  // Add or remove product from wishlist
  // This function is called when the user clicks the add to wishlist button in the product page
  // It updates the wishlist on the server and shows a toast notification
  const addToWishlist = async (product, isInWishlist) => {
    if (!userId || !token) {
      toast.error(t("wishlist.loginRequired"));
      return;
    }

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
    // Wrap the entire app in AlertProvider for alert dialogs
    <AlertProvider>
      {/* Use BrowserRouter with basename for deployment in subdirectory
          Use Toaster for toast notifications*/}
      <Router basename="/shop">
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
        <div className="flex flex-col bg-gray-50 w-full max-w-[1920px] min-h-[100dvh] mx-auto">
          <Suspense fallback={null}>
            <Header
              onLoginClick={() => setIsLoginModalOpen(true)}
              onRegisterClick={() => setIsRegisterModalOpen(true)}
              onCartClick={() => setIsCartOpen(true)}
              cartItems={cartItems}
              wishlist={wishlist}
              onWishlistClick={() => setIsWishlistOpen(true)}
              setToken={setToken}
              setUserId={setUserId}
              setUserRole={setRole}
              onLogout={handleLogout}
              isLoggedIn={!!token}
              role={role}
            />
          </Suspense>

          <Suspense fallback={null}>
            <CartModal
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              fetchProductDetails={fetchProductDetails}
              userId={userId}
            />
          </Suspense>

          <Suspense fallback={null}>
            <WishlistModal
              isOpen={isWishlistOpen}
              onClose={() => setIsWishlistOpen(false)}
              wishlist={wishlist}
              fetchProductDetails={fetchProductDetails}
              onAddToCart={handleAddToCart}
              onRemoveFromWishlist={(product) => addToWishlist(product, true)}
            />
          </Suspense>

          <Suspense fallback={null}>
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
          </Suspense>

          <Suspense fallback={null}>
            <Modal
              isOpen={isRegisterModalOpen}
              onClose={() => setIsRegisterModalOpen(false)}>
              <RegisterPage
                setToken={setToken}
                setUserId={setUserId}
                onClose={() => setIsRegisterModalOpen(false)}
              />
            </Modal>
          </Suspense>
          {/* Main content area where routes are rendered
          This is where the main content of the app will be displayed based on the current route */}
          <div className="app-content">
            <Suspense fallback={null}>
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
                      addToCart={handleAddToCart}
                      setCartItems={setCartItems}
                      removeFromCart={handleRemoveFromCart}
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route
                  path="/verify-email/:token"
                  element={<VerifyEmailPage />}
                />
                <Route path="/503" element={<ServiceUnavailablePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          
          {/*<ChatBot
            token={token}
            userId={userId}
            onOpenCart={handleOpenCart}
            onOpenWishlist={handleOpenWishlist}
            onLogout={handleLogout}
            onOpenAddProductForm={handleOpenAddProductForm}
            onCreateDiscount={handleCreateDiscount}
            onSendNewsletter={handleSendNewsletter}
          />*/}

          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </Router>
    </AlertProvider>
  );
};

export default App;
