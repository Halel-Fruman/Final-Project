import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Icon } from "@iconify/react";
import logo from "../../logo-ilan-g.svg";
import LanguageSelector from "../LanguageSelector";
import Login from "../../pages/PersonalArea/LoginPage";
import Register from "../../pages/Registeration/RegisterPage";

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
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header
      id="general"
      className="bg-gray-50 shadow border-b-2 border-gray-200"
      aria-label="Navigation Header"
      >

      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Logo" className="h-12 w-12" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-x-4">
          {isLoggedIn && role === "admin" && (
            <Link
              to="/SysAdmin"
              className="text-sm text-gray-700 hover:text-primaryColor font-medium">
              {t("header.admin_area")}
            </Link>
          )}
          {isLoggedIn && role === "storeManager" && (
            <Link
              to="/store-management"
              className="text-sm text-gray-700 hover:text-primaryColor font-medium">
              {t("header.store_area")}
            </Link>
          )}
          {isLoggedIn && (
            <Link
              to="/personal-area"
              className="text-sm text-gray-700 hover:text-primaryColor font-medium">
              {t("header.personal_area")}
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={onLogout}
              title={t("header.logout")}
              className="text-gray-700 hover:text-red-600">
              <Icon icon="mdi-light:logout" width="24" height="24" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm text-gray-700 hover:text-primaryColor">
                {t("login.title")}
              </button>
              <div className="h-6 border-r border-gray-300"></div>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-sm text-gray-700 hover:text-primaryColor">
                {t("register.title")}
              </button>
            </>
          )}

          <LanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={i18n.language}
          />

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative"
            aria-label="Shopping Cart">
            <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {cartItems?.length || 0}
            </span>
          </button>

          {/* Wishlist */}
          <button
            onClick={onWishlistClick}
            className="relative"
            aria-label="Wishlist">
            <HeartIconSolid className="h-6 w-6 text-primaryColor" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700"
            aria-label="Open Mobile Menu">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="lg:hidden"
        aria-label="Mobile Menu">
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-20 w-80 bg-white shadow-lg border-l border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <img src={logo} alt="Logo" className="h-10" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close Mobile Menu">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <LanguageSelector
                changeLanguage={changeLanguage}
                currentLanguage={i18n.language}
              />
              <div className="flex items-center space-x-4">
                <button onClick={onCartClick} className="relative">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {cartItems?.length || 0}
                  </span>
                </button>
                <button onClick={onWishlistClick} aria-label="Wishlist">
                  <HeartIconSolid className="h-6 w-6 text-primaryColor" />
                </button>
              </div>
            </div>

            {isLoggedIn && role === "admin" && (
              <Link
                to="/SysAdmin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-primaryColor font-medium">
                {t("header.admin_area")}
              </Link>
            )}
            {isLoggedIn && role === "storeManager" && (
              <Link
                to="/store-management"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-primaryColor  font-medium">
                {t("header.store_area")}
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to="/personal-area"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-primaryColor font-medium">
                {t("header.personal_area")}
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="w-full text-center text-xl font-bold text-red-600 hover:text-red-700 ">
                {t("header.logout")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-primaryColor text-xl font-bold text-white py-2 rounded hover:bg-secondaryColor">
                  {t("login.title")}
                </button>
                <button
                  onClick={() => {
                    setIsRegisterModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
                  {t("register.title")}
                </button>
              </>
            )}
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
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Close Login Modal">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <Login
            setToken={setToken}
            setUserId={setUserId}
            setUserRole={setUserRole}
            onClose={() => setIsLoginModalOpen(false)}
            openRegisterModal={() => {
              setIsLoginModalOpen(false);
              setIsRegisterModalOpen(true);
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
