import React from "react";
import { useTranslation } from "react-i18next";

// The Sidebar component is a functional component that takes the currentView and onViewChange as props.
const Sidebar = ({ currentView, onViewChange }) => {
  const { t } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t

  // Return the sidebar with the links to the personal details, address book, password management, and wishlist
  return (
    <div className="col-span-3 bg-white shadow rounded-lg p-4 ">
      <h2 className="text-xl font-bold mb-4">{t("personal_area.myAccount")}</h2>
      <ul className="space-y-2">
        <li
          className={`cursor-pointer ${
            currentView === "details"
              ? "text-secondaryColor font-semibold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "details" view
          onClick={() => onViewChange("details")}>
          {t("personal_area.myDetails")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "addresses"
              ? "text-secondaryColor font-semibold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "addresses" view
          onClick={() => onViewChange("addresses")}>
          {t("personal_area.addressBook")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "password"
              ? "text-secondaryColor font-semibold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "password" view
          onClick={() => onViewChange("password")}>
          {t("personal_area.passwordManagement")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "cart"
              ? "text-secondaryColor font-semibold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "cart" view
          onClick={() => onViewChange("cart")}>
          {t("personal_area.Wishlist")}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
