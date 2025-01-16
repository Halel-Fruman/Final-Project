import React, { useState } from "react";
import { Icon } from "@iconify/react";

const StoreManagement = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <div className="p-6">📊 סטטיסטיקות מכירות</div>;
      case "products":
        return <div className="p-6">🛒 ניהול מוצרים</div>;
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
      {renderContent()}
    </main>
  </div>
);
};
export default StoreManagement;
