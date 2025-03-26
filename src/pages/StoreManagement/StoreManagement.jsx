import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import { useTranslation } from "react-i18next";

const StoreManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [storeId, setStoreId] = useState(null); // Store ID managed by the user
  const [userEmail, setUserEmail] = useState([]); // Assumes email is stored in localStorage
  const { t } = useTranslation(); // The useTranslation hook is used to access the i18n instance
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const token = localStorage.getItem("token"); // Get the token from localStorage
  const [storeName, setStoreName] = useState(null); // Store ID managed by the user
  // Function to fetch the user's email from the server
  const fetchUserEmail = async (userId) => {
    // Send a GET request to the server to fetch the user data
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      return userData.email;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  };

  // Use the useEffect hook to fetch the user's email when the component mounts
  useEffect(() => {
    const fetchEmail = async () => {
      const email = await fetchUserEmail(userId);
      setUserEmail(email);
    };

    fetchEmail();
  }, [userId]);

  // Use the useEffect hook to fetch the store ID when the user email is set
  useEffect(() => {
    const fetchStoreId = async () => {
      // Fetch the list of stores from the server
      try {
        const response = await fetch("http://localhost:5000/Stores");
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const stores = await response.json();

        // Find the store where the user is a manager
        const store = stores.find((store) =>
          store.manager.some(
            (manager) =>
              manager.emailAddress.toLowerCase() === userEmail.toLowerCase()
          )
        );
        // If the store is found, set the store ID
        if (store) {
          setStoreId(store._id);
          setStoreName(store.name);
        } else {
          console.warn("User is not a manager of any store");
        }
      } catch (err) {
        console.error("Error fetching store data:", err);
      }
    };
    // Fetch the store ID when the user email is set
    if (userEmail) {
      fetchStoreId();
    } else {
      console.warn("User email not found in localStorage");
    }
  }, [userEmail]);
  // Function to render the content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <div className="p-6">📊 סטטיסטיקות מכירות</div>;
      case "products":
        return <ProductManagement storeId={storeId} />;
      case "orders":
        return <OrderManagement storeId={storeId} />;
      case "transactions":
        return <div className="p-6">💰 עסקאות</div>;
      case "store-stats":
        return <div className="p-6">📈 סטטיסטיקות כלליות</div>;
      default:
        return <div className="p-6">בחר קטגוריה מהתפריט</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md">
        <div className="p-4 text-lg font-bold">ניהול חנות: "{storeName}"</div>
        <nav className="mt-4">
          {[
            {
              id: "dashboard",
              label: "בית",
              icon: "material-symbols:home-outline",
            },
            {
              id: "products",
              label: "ניהול מוצרים",
              icon: "material-symbols:inventory-2-outline",
            },
            {
              id: "orders",
              label: "ניהול הזמנות",
              icon: "material-symbols:shopping-cart-outline",
            },
            { id: "transactions", label: "עסקאות", icon: "mdi:bank-transfer" },
            {
              id: "store-stats",
              label: "סטטיסטיקות חנות",
              icon: "material-symbols:bar-chart-outline",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center w-full p-3 text-right hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon icon={tab.icon} className="w-5 h-5 ml-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
  
      {/* Main content */}
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg p-2 h-full min-h-[80vh]">
          {storeId ? (
            renderContent()
          ) : (
            <div className="text-center text-red-600">
              {t("store_management.no_store")}
            </div>
          )}
        </div>
      </main>
    </div>
  );
  
};

export default StoreManagement;
