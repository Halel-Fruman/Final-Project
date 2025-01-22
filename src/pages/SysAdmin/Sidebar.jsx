import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAlert } from '../../components/AlertDialog.jsx';
import CategoryManagement from './CategoryManagement.jsx'; // הוספנו את ניהול הקטגוריות
import SysAdmin from './SysAdmin.jsx'; // ייבוא רכיב ניהול חנויות
import UserManagement from './UserManagement.jsx'; // הוספנו את ניהול users

const Sidebar = (token) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const { showAlert } = useAlert();

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <div className="p-6">📊 סטטיסטיקות כלליות</div>;
            case "stores":
                return <SysAdmin />; // הצגת רכיב ניהול החנויות
            case "categories":
                return <CategoryManagement />; // ניהול קטגוריות
            case "users":
                return <UserManagement token={token}
                />; // ניהול קטגוריות
            default:
                return <div className="p-6">בחר קטגוריה מהתפריט</div>;
        }
    };



    return (
        <div className="flex h-screen bg-gray-100">
            {/* תפריט צדדי */}
            <aside className="w-64 bg-white border-r shadow-md">
                <div className="p-4 bg-gray-200 text-primaryColor font-bold">{t("sysadmin.admin_management")}</div>
                <nav className="mt-4">
                    {[
                        { id: "dashboard", label: "סטטיסטיקות כלליות", icon: "material-symbols:bar-chart-outline" },
                        { id: "stores", label: "ניהול חנויות", icon: "material-symbols:business-outline" },
                        { id: "categories", label: "ניהול קטגוריות", icon: "material-symbols:bar-chart-outline" },
                        { id: "users", label: "ניהול משתמשים", icon: "material-symbols:bar-chart-outline" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`flex items-center w-full p-3 text-left hover:bg-gray-200 ${activeTab === tab.id ? "bg-gray-300 font-semibold" : ""}`}
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

export default Sidebar;
