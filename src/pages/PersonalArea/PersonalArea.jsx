import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "./PersonalFields/SideBar";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor";
import PasswordManager from "./PersonalFields/PasswordManager";
import AddressManager from "./PersonalFields/AddressManager";
import WishlistComponent from "./PersonalFields/WishlistComponent";
import OrderHistory from "./PersonalFields/OrdersHistory";
import { fetchWithTokenRefresh, forceLogout } from "../../utils/authHelpers";

const PersonalArea = ({ userId, addToWishlist, addToCart, token }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("details");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithTokenRefresh(`/api/User/${userId}`);
      if (response.status === 401) {
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (location.state?.selectedTab) {
      setCurrentView(location.state.selectedTab);
    }
  }, [location.state]);

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetchWithTokenRefresh(`/api/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.status === 401) return;
      if (!response.ok) throw new Error("Failed to update user");

      const updatedData = await response.json();
      setUser(updatedData);
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="spinner-border animate-spin w-16 h-16 border-4 border-secondaryColor border-t-transparent rounded-full"
          role="status">
          <span className="sr-only">{t("personal_area.loading")}</span>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="bg-gray-100 min-h-screen ">
      <div className="container mx-auto py-8 px-4 lg:px-0">
        <div className="lg:grid lg:grid-cols-12 gap-6 h-full">
          <aside className="lg:col-span-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden mb-4 text-xl font-bold bg-primaryColor text-white py-2 px-4 rounded-md w-full">
              <h1>{t("personal_area.toggleMenu")}</h1>
            </button>
            <div
              className={`lg:block ${
                isSidebarOpen ? "block" : "hidden"
              } bg-white shadow-lg rounded-lg mb-2 lg:rounded-none`}>
              <Sidebar
                currentView={currentView}
                onViewChange={(view) => {
                  setCurrentView(view);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </aside>

          <main className="lg:col-span-9 bg-white shadow rounded-lg p-4 sm:p-6">
            {currentView === "details" && (
              <div className="flex flex-col space-y-4">
                <PersonalAreaEditor
                  user={user}
                  setUser={setUser}
                  onSave={handleSave}
                />
              </div>
            )}
            {currentView === "addresses" && (
              <div className="flex flex-col space-y-4">
                <AddressManager
                  addresses={user.addresses}
                  userId={userId}
                  onUpdate={handleSave}
                  token={token}
                />
              </div>
            )}
            {currentView === "password" && (
              <div className="flex flex-col space-y-4">
                <PasswordManager userId={userId} />
              </div>
            )}
            {currentView === "wishlist" && (
              <div className="flex flex-col space-y-4">
                <WishlistComponent
                  wishlist={user.wishlist}
                  removeFromWishlist={addToWishlist}
                  refreshWishlist={fetchUser}
                  addToCart={addToCart}
                />
              </div>
            )}
            {currentView === "orders" && (
              <div className="flex flex-col space-y-4">
                <OrderHistory user={user} addToCart={addToCart} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <div
        className="spinner-border animate-spin w-16 h-16 border-4 border-secondaryColor border-t-transparent rounded-full"
        role="status">
        <span className="sr-only">{t("personal_area.loading")}</span>
      </div>
    </div>
  );
};

export default PersonalArea;
