import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../components/AlertDialog.jsx";
import CategoryManagement from "./CategoryManagement.jsx";
import SysAdmin from "./SysAdmin.jsx";
import UserManagement from "./UserManagement.jsx";

// The Sidebar component is a functional component that takes the token as a prop
const Sidebar = (token) => {
  const { t } = useTranslation(); // The useTranslation hook is used to access the i18n instance
  const [activeTab, setActiveTab] = useState("dashboard"); // The activeTab state is used to store the active tab
  const { showAlert } = useAlert(); // The useAlert hook is used to show an alert dialog

  // The renderContent function returns the content based on the active tab
  const renderContent = () => {
    // Switch statement to render the content based on the active tab
    switch (activeTab) {
      case "dashboard":
        return <div className="p-6">📊 סטטיסטיקות כלליות</div>;
      case "stores":
        return <SysAdmin />;
      case "categories":
        return <CategoryManagement />;
      case "users":
        return <UserManagement token={token} />;
      default:
        return <div className="p-6">בחר קטגוריה מהתפריט</div>;
    }
  };

  // The return statement contains the JSX of the Sidebar component
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-md">
        <div className="p-4 bg-gray-200 text-primaryColor font-bold">
          {t("sysadmin.admin_management")}
        </div>
        <nav className="mt-4">
          {[
            {
              id: "dashboard",
              label: "סטטיסטיקות כלליות",
              icon: "material-symbols:bar-chart-outline",
            },
            {
              id: "stores",
              label: "ניהול חנויות",
              icon: "material-symbols:business-outline",
            },
            {
              id: "categories",
              label: "ניהול קטגוריות",
              icon: "material-symbols:bar-chart-outline",
            },
            {
              id: "users",
              label: "ניהול משתמשים",
              icon: "material-symbols:bar-chart-outline",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center w-full p-3 text-left hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon icon={tab.icon} className="w-5 h-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-white shadow-md m-4 rounded-lg">
        {renderContent()}
      </main>
    </div>
  );
};

export default Sidebar;
