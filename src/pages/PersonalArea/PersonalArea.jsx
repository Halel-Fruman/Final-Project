import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "./PersonalFields/SideBar";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor";
import PasswordManager from "./PersonalFields/PasswordManager";
import AddressManager from "./PersonalFields/AddressManager";
import WishlistComponent from "./PersonalFields/WishlistComponent";

// The PersonalArea component is a functional component that takes the userId, addToWishlist, addToCart, and token as props.
const PersonalArea = ({ userId, addToWishlist, addToCart, token }) => {
  const { t } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t
  const [user, setUser] = useState(null); // useState hook to store the user data
  const [isLoading, setIsLoading] = useState(true); // useState hook to store the loading state
  const [currentView, setCurrentView] = useState("details"); // useState hook to store the current view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // useState hook to store the sidebar open state
  // fetchUser function to send a request to the server to fetch the user data based on the userId and token
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    // Try to send a request to the server to fetch the user data
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // If the response is not ok, throw an error
      if (!response.ok) throw new Error("Failed to fetch user");
      // Parse the response to JSON
      const data = await response.json();
      // Set the user state with the fetched data
      setUser(data);
    } catch (err) {
      // If an error occurs, log the error message
      console.error(err.message);
    } finally {
      // Finally, set the isLoading state to false
      setIsLoading(false);
    }
  }, [userId, token]);
  // useEffect hook to fetch the user data when the component mounts
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  // handleSave function to send a request to the server to update the user data
  const handleSave = async (updatedUser) => {
    try {
      // Try to send a PUT request to the server to update the user data
      const response = await fetch(
        `http://localhost:5000/User/${userId}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        }
      );
      // If the response is not ok, throw an error
      if (!response.ok) throw new Error("Failed to update user");
      const updatedData = await response.json(); // Parse the response to JSON
      setUser(updatedData); // Set the user state with the updated data
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };
  // If the user data is loading, display a spinner
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
  // If the user data is available, display the PersonalArea component
  return user ? (
    <div className="bg-gray-100 min-h-screen ">
      <div className="container mx-auto py-8 px-4 lg:px-0">
        <div className="lg:grid lg:grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden mb-4 bg-primaryColor text-white py-2 px-4 rounded-md w-full">
              {t("personal_area.toggleMenu")}
            </button>
            <div
              className={`lg:block ${
                isSidebarOpen ? "block" : "hidden"
              } bg-white shadow-lg rounded-lg lg:rounded-none`}>
              <Sidebar
                currentView={currentView}
                onViewChange={(view) => {
                  setCurrentView(view);
                  setIsSidebarOpen(false); // Close the sidebar after selecting a view
                }}
              />
            </div>
          </aside>

          {/* Main Content */}
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
            {/*If the current view is "addresses", display the AddressManager component */}
            {currentView === "addresses" && (
              <div className="flex flex-col space-y-4">
                <AddressManager
                  addresses={user.addresses}
                  userId={userId}
                  onUpdate={handleSave}
                />
              </div>
            )}
            {/*If the current view is "password", display the PasswordManager component */}
            {currentView === "password" && (
              <div className="flex flex-col space-y-4">
                <PasswordManager userId={userId} />
              </div>
            )}
            {/*If the current view is "cart", display the WishlistComponent component */}
            {currentView === "cart" && (
              <div className="flex flex-col space-y-4">
                <WishlistComponent
                  wishlist={user.wishlist}
                  removeFromWishlist={addToWishlist}
                  refreshWishlist={fetchUser}
                  addToCart={addToCart}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  ) : (
    // If the user data is not available, display a message
    <div className="text-center mt-6">
      <p>{t("personal_area.loadingFailed")}</p>
    </div>
  );
};

export default PersonalArea;
