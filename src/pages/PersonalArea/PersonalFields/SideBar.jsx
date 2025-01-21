import React from "react";
import { useTranslation } from "react-i18next";

const Sidebar = ({ currentView, onViewChange }) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-3 bg-white shadow rounded-lg p-4 ">
      <h2 className="text-xl font-bold mb-4">{t("personal_area.myAccount")}</h2>
      <ul className="space-y-2">
        <li
          className={`cursor-pointer ${
            currentView === "details" ? "text-secondaryColor font-semibold" : "text-gray-600 hover:text-secondaryColor"
          }`}
          onClick={() => onViewChange("details")}
        >
          {t("personal_area.myDetails")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "addresses" ? "text-secondaryColor font-semibold" : "text-gray-600 hover:text-secondaryColor"
          }`}
          onClick={() => onViewChange("addresses")}
        >
          {t("personal_area.addressBook")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "password" ? "text-secondaryColor font-semibold" : "text-gray-600 hover:text-secondaryColor"
          }`}
          onClick={() => onViewChange("password")}
        >
          {t("personal_area.passwordManagement")}
        </li>
        <li
          className={`cursor-pointer ${
            currentView === "cart" ? "text-secondaryColor font-semibold" : "text-gray-600 hover:text-secondaryColor"
          }`}
          onClick={() => onViewChange("cart")}
        >
          {t("personal_area.Wishlist")}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
