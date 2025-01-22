import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProductManagement from "./ProductManagement.jsx";
import { useTranslation } from "react-i18next";


const StoreManagement = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [storeId, setStoreId] = useState(null); // Store ID managed by the user
  const [userEmail, setUserEmail] = useState([]); // Assumes email is stored in localStorage
  const { t } = useTranslation();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchUserEmail = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}`,
        {headers: {
          Authorization: `Bearer ${token}`,
        },}
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      return userData.email; // הנחה שהשדה email קיים באובייקט המשתמש
    } catch (error) {
      console.error(error.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await fetchUserEmail(userId);
      setUserEmail(email);
    };

    fetchEmail();
  }, [userId]);
  console.log("mmm", userEmail);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const response = await fetch("http://localhost:5000/Stores");
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const stores = await response.json();

        // Find the store where the user is a manager
        const store = stores.find((store) =>
          store.manager.some((manager) => manager.emailAddress.toLowerCase() === userEmail.toLowerCase())

      );

        if (store) {
          setStoreId(store._id);
        } else {
          console.warn("User is not a manager of any store");
        }
      } catch (err) {
        console.error("Error fetching store data:", err);
      }
    };

    if (userEmail) {
      fetchStoreId();
    } else {
      console.warn("User email not found in localStorage");
    }
  }, [userEmail]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <div className="p-6">📊 סטטיסטיקות מכירות</div>;
      case "products":
        return <ProductManagement storeId={storeId} />;
      case "orders":
        return <div className="p-6">📦 ניהול הזמנות</div>;
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
      {/* תפריט צדדי */}
      <aside className="w-64 bg-white border-r shadow-md">
        <div className="p-4 text-lg font-bold">🏪 ניהול חנות</div>
        <nav className="mt-4">
          {[
            { id: "dashboard", label: "בית", icon: "material-symbols:home-outline" },
            { id: "products", label: "ניהול מוצרים", icon: "material-symbols:inventory-2-outline" },
            { id: "orders", label: "ניהול הזמנות", icon: "material-symbols:shopping-cart-outline" },
            { id: "transactions", label: "עסקאות", icon: "mdi:bank-transfer" },
            { id: "store-stats", label: "סטטיסטיקות חנות", icon: "material-symbols:bar-chart-outline" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center w-full p-3 text-left hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon icon={tab.icon} className="w-5 h-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* אזור התוכן */}
      <main className="flex-1 p-6 bg-white shadow-md m-4 rounded-lg">
        {storeId ? (
          renderContent()
        ) : (
          <div className="text-center text-red-600">
            {t("store_management.no_store")}
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreManagement;
