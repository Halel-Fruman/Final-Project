/**
 * @file SideBar.jsx
 * @description This component renders the sidebar for the personal area,
 * allowing users to navigate between different sections.
 */

import { useTranslation } from "react-i18next";

/**
 * @function Sidebar
 * @description Component for rendering the sidebar in the personal area,
 * allowing users to navigate between different sections.
 * @param {Object} props - Component properties.
 * @param {string} props.currentView - The current view in the personal area .
 * @param {Function} props.onViewChange - Function to handle view changes when a sidebar item is clicked.
 */
const Sidebar = ({ currentView, onViewChange }) => {
  const { t } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t

  // Return the sidebar with the links to the personal details, address book, password management, and wishlist
  return (
    <div className="col-span-3 bg-white shadow rounded-lg p-4 ">
      <h1 className="text-xl font-bold mb-4">{t("personal_area.myAccount")}</h1>
      <ul className="space-y-2">
        <li
          className={`cursor-pointer ${
            currentView === "details"
              ? "text-primaryColor text-xl font-bold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "details" view
          onClick={() => onViewChange("details")}>
          {t("personal_area.myDetails")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "addresses"
              ? "text-primaryColor text-xl font-bold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "addresses" view
          onClick={() => onViewChange("addresses")}>
          {t("personal_area.addressBook")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "password"
              ? "text-primaryColor text-xl font-bold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "password" view
          onClick={() => onViewChange("password")}>
          {t("personal_area.passwordManagement")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "wishlist"
              ? "text-primaryColor text-xl font-bold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "cart" view
          onClick={() => onViewChange("wishlist")}>
          {t("personal_area.Wishlist")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "orders"
              ? "text-primaryColor text-xl font-bold"
              : "text-gray-600 hover:text-secondaryColor"
          }`}
          // onClick event handler to call the onViewChange function with the "cart" view
          onClick={() => onViewChange("orders")}>
          {t("personal_area.orders")}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
