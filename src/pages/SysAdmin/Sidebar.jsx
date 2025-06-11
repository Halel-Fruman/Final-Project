import  { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../components/AlertDialog.jsx";
import CategoryManagement from "./CategoryManagement.jsx";
import SysAdmin from "./SysAdmin.jsx";
import UserManagement from "./UserManagement.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const Sidebar = ({ token }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false); // תפריט מובייל
  const { showAlert } = useAlert();

  const tabs = [
    {
      id: "dashboard",
      label: "סטטיסטיקות כלליות",
      icon: "material-symbols:bar-chart-outline",
    },
    {
      id: "stores",
      label: "ניהול חנויות",
      icon: "material-symbols:bar-chart-outline",
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
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 relative">
      {/* Top bar for mobile */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 shadow ">
        <span className="font-bold text-primaryColor">
          {t("sysadmin.admin_management")}
        </span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl">
          <Icon icon="material-symbols:menu" width="28" />
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r shadow-md p-4">
        <div className="text-lg font-bold mb-2">{t("sysadmin.admin_management")}</div>
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => (

            <button
              key={tab.id}
              className={`flex items-center text-right w-full p-3 rounded hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon icon={tab.icon} className="w-5 h-5 ml-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-b shadow z-10">
          <nav className="flex flex-col px-4 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center  text-right py-3 border-b hover:bg-gray-100 ${
                  activeTab === tab.id ? "bg-gray-200 font-semibold" : ""
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
        </div>
      )}

      {/* Main content */}
      {/* <main className="flex-1 p-4 bg-white  overflow-y-auto h-fit"> */}
      <main className="flex-1 p-4 pl-6 bg-white shadow-md m-6 rounded-lg h-fit overflow-y-auto">

          {renderContent()}
      </main>
    </div>
  );
};

export default Sidebar;
