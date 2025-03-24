import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import LanguageSelector from "../LanguageSelector";
import { Icon } from "@iconify/react";
import logo from "../../logo-ilan-g.svg";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Login from "../..//pages/PersonalArea/LoginPage";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Register from "../../pages/Registeration/RegisterPage";
// The Header component is a functional component that takes the onLogout, isLoggedIn, onCartClick, cartItems, role, setToken, setUserId, and setUserRole as props.
const Header = ({
  onLogout,
  isLoggedIn,
  onCartClick,
  cartItems,
  role,
  setToken,
  setUserId,
  setUserRole,
  wishlist,
onWishlistClick,
}) => {
  // The useTranslation hook is used to access the i18n instance and the t function
  const { i18n, t } = useTranslation();
  // The useState hook is used to manage the mobileMenuOpen, isLoginModalOpen, and isRegisterModalOpen states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  // The changeLanguage function is used to change the language of the application
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  console.log(isLoggedIn);
  console.log(role);

  return (
    <header className="bg-gray-50 shadow border-b-2 border-gray-200">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="logo-ilan-g.svg" className="h-12 w-12" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-2">
          {isLoggedIn &&
            role === "admin" && ( // If the user is an admin, display the link to the system admin area
              <Link
                to="/SysAdmin"
                className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
                איזור ניהול מערכת
              </Link>
            )}

          {isLoggedIn &&
            role === "storeManager" && ( // If the user is a store manager, display the link to the store management area
              <Link
                to="/store-management"
                className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
                איזור ניהול חנות
              </Link>
            )}

          {isLoggedIn && ( // If the user is logged in, display the link to the personal area
            <Link
              to="/personal-area"
              className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
              {t("header.personal_area")}
            </Link>
          )}
          {/* If the user is logged in, display the logout button */}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              title={t("header.logout")}
              className="text-sm font-medium text-gray-700 hover:text-gray-800">
              <Icon icon="mdi-light:logout" width="24" height="24" />
            </button>
          ) : (
            // If the user is not logged in, display the login and register buttons
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
                {t("login.title")}
              </button>
              <div className="h-6 border-r border-gray-300"></div>
              {/*If the user is not logged in, display the login and register buttons */}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-sm font-medium text-gray-700 hover:text-gray-800">
                {t("register.title")}
              </button>
            </>
          )}
          {/* Language Selector */}
          <LanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={i18n.language}
          />
          {/* Cart Button */}
          <button onClick={onCartClick} className="relative">
            <ShoppingCartIcon className="h-6 w-6 text-gray-500" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs">
              {cartItems?.length || 0}
            </span>
          </button>
          {/* Wishlist Button */}
            <button onClick={onWishlistClick}>
              <HeartIconSolid className="h-6 w-6 text-primaryColor" />
            </button>
        </div>
        {/*Mobile Menu */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="lg:hidden">
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-20 w-80 bg-gray-700 shadow-lg">
          <div className="flex items-center justify-between p-4 bg-secondaryColor">
            <Link to="/" className="flex items-center">
              <span className="text-lg font-bold text-gray-700"></span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-6">
            <div className="space-y-4">
              <LanguageSelector
                changeLanguage={changeLanguage}
                currentLanguage={i18n.language}
              />
              {/* If the user is an admin, display the link to the system admin area */}
              {isLoggedIn && role === "admin" && (
                <Link
                  to="/SysAdmin"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  איזור ניהול מערכת
                </Link>
              )}
              {/* If the user is a store manager, display the link to the store management area */}
              {isLoggedIn && role === "storeManager" && (
                <Link
                  to="/store-management"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  איזור ניהול חנות
                </Link>
              )}
              {/* If the user is logged in, display the link to the personal area */}
              {isLoggedIn && (
                <Link
                  to="/personal-area"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  {t("header.personal_area")}
                </Link>
              )}
              {/* If the user is logged in, display the logout button */}
              {isLoggedIn ? (
                <button
                  onClick={onLogout}
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-red-500 rounded hover:bg-red-600">
                  {t("header.logout")}
                </button>
              ) : (
                // If the user is not logged in, display the login and register buttons
                <>
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-green-500 rounded hover:bg-green-600">
                    {t("login.title")}
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-blue-500 rounded hover:bg-blue-600">
                    {t("register.title")}
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
      {/* Login Modal */}
      <Dialog
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogPanel className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <Login
            setToken={setToken}
            setUserId={setUserId}
            setUserRole={setUserRole}
            onClose={() => setIsLoginModalOpen(false)}
            openRegisterModal={() => {
              setIsLoginModalOpen(false); //close the login modal
              setIsRegisterModalOpen(true); //open the register modal
            }}
          />
        </DialogPanel>
      </Dialog>

      {/* Register Modal */}
      <Dialog
        open={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogPanel className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <Register
            setToken={setToken}
            setUserId={setUserId}
            onClose={() => setIsRegisterModalOpen(false)}
          />
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
