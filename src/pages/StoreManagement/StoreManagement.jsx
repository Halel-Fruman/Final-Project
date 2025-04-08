import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import { useTranslation } from "react-i18next";

const StoreManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [storeName, setStoreName] = useState(null);

  const { t } = useTranslation();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // שליפת אימייל לפי userId
  const fetchUserEmail = async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      return userData.email;
    } catch (error) {
      console.error("שגיאה בשליפת אימייל:", error.message);
      return null;
    }
  };

  // קבלת האימייל מהשרת
  useEffect(() => {
    if (!userId) {
      console.warn("❌ לא נמצא userId ב-localStorage");
      return;
    }

    const fetchEmail = async () => {
      const email = await fetchUserEmail(userId);
      console.log("✅ userEmail מהשרת:", email);
      setUserEmail(email);
    };

    fetchEmail();
  }, [userId]);

  // חיפוש החנות לפי אימייל מנהל
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const response = await fetch("/api/Stores");
        if (!response.ok) throw new Error("Failed to fetch stores");

        const stores = await response.json();

        const store = stores.find((store) =>
          Array.isArray(store.manager) &&
          store.manager.some((manager) =>
            String(manager?.emailAddress || "")
              .trim()
              .toLowerCase() === String(userEmail || "").trim().toLowerCase()
          )
        );

        // הדפסה לבדיקה
        console.log("📨 userEmail:", `"${userEmail}"`);
        stores.forEach((store) => {
          console.log("🔍 Checking store:", store.name);
          store.manager?.forEach((manager) => {
            console.log("   - manager:", `"${manager.emailAddress}"`);
          });
        });

        if (store) {
          setStoreId(store._id.toString());
          setStoreName(store.name);
          console.log("✅ חנות שנמצאה:", store.name);
        } else {
          console.warn("❌ המשתמש לא מוגדר כמנהל באף חנות");
        }
      } catch (err) {
        console.error("שגיאה בשליפת חנויות:", err);
      }
    };

    if (userEmail && userEmail.trim() !== "") {
      fetchStoreId();
    } else {
      console.warn("⏳ userEmail עדיין לא נטען");
    }
  }, [userEmail]);

  // תוכן הטאב
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
        <div className="p-4 text-lg font-bold">
          ניהול חנות: {storeName ? `"${storeName}"` : "לא נטען"}
        </div>
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

      {/* Main */}
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
