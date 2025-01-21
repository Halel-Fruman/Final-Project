import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import LanguageSelector from "../LanguageSelector";
import { Icon } from "@iconify/react";
import logo from "../../logo-ilan-g.svg";
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Header = ({ onLogout, isLoggedIn, onCartClick, cartItems, role }) => {
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  console.log(isLoggedIn);   // האם המשתמש מחובר?
  console.log(role);   // מה הערך של ה-role?

  return (

    <header className="bg-gray-50 shadow border-b-2 border-gray-200">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* לוגו */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="logo-ilan-g.svg" className="h-12 w-12" />
          </Link>
        </div>

        {/* ניווט דסקטופ */}
        <div className="hidden lg:flex items-center space-x-2">
          {isLoggedIn && role === 'admin' && (
            <Link
              to="/SysAdmin"
              className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
                  איזור ניהול מערכת 
                  </Link>
          )}

          {isLoggedIn && role === 'storeManager' && (
            <Link 
              to="/store-management"
              className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
                  איזור ניהול חנות 
                  </Link>
          )}

          {isLoggedIn && (
            <Link
              to="/personal-area"
              className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800">
              {t("header.personal_area")}
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={onLogout}
              title={t("header.logout")}
              className="text-sm font-medium text-gray-700 hover:text-gray-800">
              <Icon icon="mdi-light:logout" width="24" height="24" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 p-2 hover:text-gray-800 ">
                {t("login.title")}
              </Link>
              <div className="h-6 border-r border-gray-300"></div>

              <Link
                to="/register"
                className="text-sm font-medium text-gray-700 hover:text-gray-800">
                {t("register.title")}
              </Link>
            </>
          )}

          <LanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={i18n.language}
          />
          <button onClick={onCartClick} className="relative">
            <ShoppingCartIcon className="h-6 w-6 text-gray-500" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs">
              {cartItems?.length || 0}
            </span>
          </button>
        </div>

        {/* כפתור תפריט מובייל */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* תפריט מובייל */}
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
              {/* בורר שפה */}
              <LanguageSelector
                changeLanguage={changeLanguage}
                currentLanguage={i18n.language}
              />

              {isLoggedIn && role === 'admin' && (
                <Link
                  to="/SysAdmin"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  איזור ניהול מערכת 
                                 </Link>
              )}

              {isLoggedIn && role === 'storeManager' && (
                <Link
                  to="/store-management"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  איזור ניהול חנות 
                                 </Link>
              )}

              {isLoggedIn && (
                <Link
                  to="/personal-area"
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-secondaryColor rounded hover:bg-primaryColor">
                  {t("header.personal_area")}
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  onClick={onLogout}
                  className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-red-500 rounded hover:bg-red-600">
                  {t("header.logout")}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-green-500 rounded hover:bg-green-600">
                    {t("login.title")}
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-blue-500 rounded hover:bg-blue-600">
                    {t("register.title")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
