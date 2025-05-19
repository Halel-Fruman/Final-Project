import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import { useTranslation } from "react-i18next";
import StoreDashboard from "./StoreDashboard.jsx";
import StoreAnalytics from "./StoreAnalytics.jsx";
import { refreshAccessToken } from "../../utils/authHelpers";

const StoreManagement = () => {
  const { storeId: paramStoreId } = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [storeName, setStoreName] = useState("לא נטען");
  const [isFetchingStore, setIsFetchingStore] = useState(true);
  const { t, i18n } = useTranslation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchStoreById = async () => {
      try {
        setIsFetchingStore(true);
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) accessToken = await refreshAccessToken();
        if (!accessToken) throw new Error("No valid access token");

        const res = await fetch(`/api/Stores/${paramStoreId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Store not found");
        const store = await res.json();
        setStoreId(store._id);
        setStoreName(
          store.name?.[i18n.language] || store.name?.he || store.name?.en
        );
      } catch (error) {
        console.error("Failed to load store by ID", error.message);
      } finally {
        setIsFetchingStore(false);
      }
    };

    if (paramStoreId) {
      fetchStoreById();
    }
  }, [paramStoreId, i18n.language]);

  const fetchUserEmail = async (userId) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) accessToken = await refreshAccessToken();
      if (!accessToken) throw new Error("No valid access token");

      const response = await fetch(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userData = await response.json();
      return userData.email;
    } catch (error) {
      console.error("שגיאה בשליפת אימייל:", error.message);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;
    const fetchEmail = async () => {
      const email = await fetchUserEmail(userId);
      setUserEmail(email);
    };
    fetchEmail();
  }, [userId]);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) accessToken = await refreshAccessToken();
        if (!accessToken) throw new Error("No valid access token");

        const response = await fetch("/api/Stores", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const stores = await response.json();

        const store = stores.find(
          (store) =>
            Array.isArray(store.manager) &&
            store.manager.some(
              (manager) =>
                String(manager?.emailAddress || "")
                  .trim()
                  .toLowerCase() ===
                String(userEmail || "")
                  .trim()
                  .toLowerCase()
            )
        );

        if (store) {
          setStoreId(store._id.toString());
          const name =
            store.name?.[i18n.language] || store.name?.he || store.name?.en;
          setStoreName(typeof name === "string" ? name : "לא זמין");
        }
      } catch (err) {
        console.error("שגיאה בשליפת חנויות:", err);
      } finally {
        if (!paramStoreId) setIsFetchingStore(false);
      }
    };

    if (userEmail && !paramStoreId) {
      setIsFetchingStore(true);
      fetchStoreId();
    }
  }, [userEmail, i18n.language, paramStoreId]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <StoreDashboard key="dashboard" storeId={storeId} />;
      case "products":
        return <ProductManagement key="products" storeId={storeId} />;
      case "orders":
        return (
          <OrderManagement
            key="orders"
            storeId={storeId}
            title="ניהול הזמנות"
          />
        );
      case "transactions":
        return (
          <OrderManagement
            key="transactions"
            storeId={storeId}
            statusFilter={["completed", "canceled"]}
            title="רשימת עסקאות"
          />
        );
      case "store-stats":
        return <StoreAnalytics key="store-stats" storeId={storeId} />;
      default:
        return <div className="p-6">בחר קטגוריה מהתפריט</div>;
    }
  };

  const tabs = [
    { id: "dashboard", label: "בית", icon: "material-symbols:home-outline" },
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
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <div className="lg:hidden flex justify-between items-center bg-white p-4 shadow">
        <span className="font-bold">
          {storeId ? `ניהול "${storeName}"` : "ניהול חנות"}
        </span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl">
          <Icon icon="material-symbols:menu" width="28" />
        </button>
      </div>

      <aside
        className={`bg-white border-r shadow-md w-full lg:w-64 p-4 transition-all duration-300 ${
          menuOpen ? "block" : "hidden"
        } lg:block`}>
        <div className="text-lg font-bold hidden lg:block">
          ניהול חנות: {storeId ? `"${storeName}"` : "לא נטען"}
        </div>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center text-right w-full p-3 rounded hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setMenuOpen(false);
              }}>
              <Icon icon={tab.icon} className="w-5 h-5 ml-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg p-2 min-h-[80vh]">
          {isFetchingStore ? (
            <div className="flex justify-center items-center h-[50vh]">
              <Icon
                icon="line-md:loading-twotone-loop"
                className="w-12 h-12 text-primaryColor animate-spin"
              />
            </div>
          ) : storeId ? (
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
//
