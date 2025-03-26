import React, { useEffect, useState, useCallback } from "react"; // import the required libraries from react
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // import the required libraries from react-router-dom
import { useTranslation } from "react-i18next"; // import the useTranslation hook from react-i18next
import { Toaster } from "react-hot-toast";
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
import AddAddressPage from "./pages/Registeration/AddAddressPage.jsx";
import StoreManagement from "./pages/StoreManagement/StoreManagement.jsx";
import WishlistModal from "./components/WishlistModal";

//
const App = () => {
  const { i18n } = useTranslation(); // use the useTranslation hook to get the i18n object
  const [token, setToken] = useState(localStorage.getItem("token")); // use the useState hook to create a token state variable and set it to the token stored in the local storage
  const [userId, setUserId] = useState(localStorage.getItem("userId")); // use the useState hook to create a userId state variable and set it to the userId stored in the local storage
  const [role, setRole] = useState(localStorage.getItem("role")); // use the useState hook to create a role state variable and set it to the role stored in the local storage
  const [wishlist, setWishlist] = useState([]); // use the useState hook to create a wishlist state variable and set it to an empty array
  const [wishlistLoading, setWishlistLoading] = useState(true); // use the useState hook to create a wishlistLoading state variable and set it to true
  const [cartItems, setCartItems] = useState([]); // use the useState hook to create a cartItems state variable and set it to an empty array
  const [isCartOpen, setIsCartOpen] = useState(false); // use the useState hook to create an isCartOpen state variable and set it to false
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // חדש
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // use the useState hook to create an isLoginModalOpen state variable and set it to false
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // use the useState hook to create an isRegisterModalOpen state variable and set it to false

  // handleLogout function to remove the token, userId, and role from the local storage and set them to null
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    setToken(null);
    setUserId(null);
    setRole(null);
  };
  // verifyToken function to check if the token is stored in the local storage and if it is,
  // it sends a request to the server to verify the token
  const verifyToken = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserRole = localStorage.getItem("role");
    // check if the token is stored in the local storage
    if (storedToken && storedUserId) {
      try {
        // send a request to the server to verify the token
        const response = await fetch(
          "http://localhost:5000/User/verify-token",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        // check if the response is ok
        if (response.ok) {
          setToken(storedToken);
          setUserId(storedUserId);
          setRole(storedUserRole);
        } else {
          handleLogout();
        }
        // catch any errors and log them to the console
      } catch (error) {
        console.error("Error verifying token:", error);
        handleLogout();
      }
    }
  };
  useEffect(() => {
    verifyToken();
  }, []);
  // handleOpenCart function to open the cart modal
  const handleOpenCart = () => setIsCartOpen(true);
  // handleCloseCart function to close the cart modal
  const handleCloseCart = () => setIsCartOpen(false);
  // loadCart function to fetch the cart items from the server
  const handleOpenWishlist = () => setIsWishlistOpen(true);
const handleCloseWishlist = () => setIsWishlistOpen(false);

  const loadCart = useCallback(async () => {
    if (userId && token) {
      const data = await fetchCart(userId, token);
      setCartItems(data);
    }
  }, [userId, token]);
  // handleRemoveFromCart function to remove a product from the cart
  const handleRemoveFromCart = async (productId) => {
    const updatedCart = await removeFromCart(userId, token, productId);
    if (updatedCart) {
      setCartItems(updatedCart);
    }
  };
  // handleAddToCart function to add a product to the cart
  const handleAddToCart = async (product) => {
    const updatedCart = await addToCart(userId, token, product);
    if (updatedCart) {
      setCartItems(updatedCart);
      loadCart();
    }
  };
  // useEffect hook to change the direction of the page based on the selected language
  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);
  // loadWishlist function to fetch the wishlist items from the server
  const loadWishlist = useCallback(async () => {
    setWishlistLoading(true);
    if (!userId || !token) {
      setWishlist([]);
      setWishlistLoading(false);
      return;
    }
    // fetchWishlist function to fetch the wishlist items from the server
    const data = await fetchWishlist(userId, token);
    setWishlist(data);
    setWishlistLoading(false);
  }, [userId, token]);

  useEffect(() => {
    verifyToken();
  }, []);
  // useEffect hook to load the cart and wishlist items when the token and userId change
  useEffect(() => {
    if (token && userId) {
      loadCart();
      loadWishlist();
    }
  }, [token, userId, loadWishlist, loadCart]);
  // addToWishlist function to add a product to the wishlist
  const addToWishlist = async (product, isInWishlist) => {
    const success = await updateWishlist(userId, token, product, isInWishlist); // updateWishlist function to add or remove a product from the wishlist
    if (success) {
      loadWishlist();
    }
  };
  // return the JSX of the App component
  return (
    // AlertProvider component to wrap the entire application and provide the alert context to all components

   <AlertProvider>
      {/*Router component to wrap the entire application and provide the routing context to all components */}
      <Router>
            <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

        {/*Header component to display the header of the application         */}
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
        {/*CartModal component to display the cart modal */}
        <CartModal
          isOpen={isCartOpen}
          onClose={handleCloseCart}
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          fetchProductDetails={fetchProductDetails}
        />
        <WishlistModal
          isOpen={isWishlistOpen}
          onClose={handleCloseWishlist}
          wishlist={wishlist}
          fetchProductDetails={fetchProductDetails}
          onAddToCart={handleAddToCart}
          onRemoveFromWishlist={(product) =>
            addToWishlist(product, true /* isInWishlist */)
          }
        />
        {/*Modal component to display the login modal */}
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
                token && role === "storeManager" ? (
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
