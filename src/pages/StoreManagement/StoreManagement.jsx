/**
 * @file StoreManagement.jsx
 * @description This file contains the StoreManagement component which allows users to manage their store,
 * including products, orders, transactions, and store settings.
 * It uses React hooks for state management and side effects, and integrates with the backend API for data fetching.
 * The component also handles user authentication and authorization,
 * ensuring that only authorized users can access store management features.
 * It includes a responsive sidebar for navigation and dynamically renders content based on the selected tab.
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import { useTranslation } from "react-i18next";
import StoreDashboard from "./StoreDashboard.jsx";
import StoreAnalytics from "./StoreAnalytics.jsx";
import { useLocation } from "react-router-dom";
import StoreSettings from "./StoreSettings.jsx";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";
import { useNavigate } from "react-router-dom";

/**
 * @function StoreManagement
 * @description Main component for managing a store, including navigation and content rendering.
 * It fetches store data, user email, and handles tab navigation.
 * It also manages the sidebar menu state and renders different components based on the active tab.
 * @returns {JSX.Element} The rendered StoreManagement component.
 */
const StoreManagement = () => {
  const { storeId: paramStoreId } = useParams();
  const location = useLocation();
  const { tab, openAddProductForm, autofill } = location.state || {};
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [storeName, setStoreName] = useState("לא נטען");
  const [isFetchingStore, setIsFetchingStore] = useState(true);
  const { t, i18n } = useTranslation();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const navigate = useNavigate();

  // Fetch store by ID if provided in the URL
  // This function retrieves the store details and sets the storeId and storeName state variables.
  // It also handles unauthorized access by redirecting to the home page.
  // If the store is not found, it navigates to the home page.
  useEffect(() => {
    const fetchStoreById = async () => {
      try {
        setIsFetchingStore(true);
        const res = await fetchWithTokenRefresh(`/api/Stores/${paramStoreId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401 || res.status === 403) {
          return navigate("/");
        }

        if (!res.ok) throw new Error("Store not found");

        const store = await res.json();
        setStoreId(store._id);
        setStoreName(
          store.name?.[i18n.language] || store.name?.he || store.name?.en
        );
      } catch (error) {
        console.error("Failed to load store by ID", error.message);
        navigate("/");
      } finally {
        setIsFetchingStore(false);
      }
    };

    if (paramStoreId) {
      fetchStoreById();
    }
  }, [paramStoreId, i18n.language]);

  // Fetch user email based on userId
  // This function retrieves the user's email from the backend API using the userId stored in localStorage.
  // It handles errors by logging them and returning null if the email cannot be fetched.
  const fetchUserEmail = async (userId) => {
    try {
      const response = await fetchWithTokenRefresh(`/api/user/${userId}`);
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

  // Fetch store ID based on user email
  // This function retrieves the store ID by checking if the user's email matches any store manager's email.
  // It sets the storeId and storeName state variables if a matching store is found.
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const response = await fetchWithTokenRefresh("/api/Stores");
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

  // Render content based on the active tab
  // This function returns the appropriate component based on the active tab state.
  // It handles different tabs like dashboard, products, orders, transactions, store stats, and settings.
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <StoreDashboard key="dashboard" storeId={storeId} />;
      case "products":
        return (
          <ProductManagement
            key="products"
            storeId={storeId}
            autoOpenAddForm={openAddProductForm}
            autofill={autofill}
          />
        );
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
      case "settings":
        return (
          <StoreSettings
            key="settings"
            storeId={storeId}
            token={localStorage.getItem("accessToken")}
          />
        );
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
    {
      id: "settings",
      label: "הגדרות חנות",
      icon: "material-symbols:settings-outline",
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
          ניהול חנות: {storeId ? `"${storeName}"` : ""}
        </div>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center  w-full p-3 rounded hover:bg-gray-200 ${
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
