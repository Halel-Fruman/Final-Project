import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "./PersonalFields/SideBar";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor";
import PasswordManager from "./PersonalFields/PasswordManager";
import AddressManager from "./PersonalFields/AddressManager";
import WishlistComponent from "./PersonalFields/WishlistComponent";

const PersonalArea = ({ userId, addToWishlist }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("details"); // ניווט בין תצוגות

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      );
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
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />

          {/* Main Content */}
          <div className="col-span-9 bg-white shadow rounded-lg p-6">
            {currentView === "details" && (
              <PersonalAreaEditor
                user={user}
                setUser={setUser}
                onSave={handleSave}
              />
            )}
            {currentView === "addresses" && (
              <AddressManager addresses={user.addresses} userId={userId}  onUpdate={handleSave} />
            )}
            {currentView === "password" && <PasswordManager userId={userId} />}
            {currentView === "cart" && (
              <WishlistComponent
                wishlist={user.wishlist}
                removeFromWishlist={addToWishlist}
                refreshWishlist={fetchUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center mt-6">
      <p>{t("personal_area.loadingFailed")}</p>
    </div>
  );
};

export default PersonalArea;
