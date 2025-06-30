/**
 * @file PersonalArea.jsx
 * @description This component renders the personal area of a user,
 * allowing them to view and edit their personal information, manage their address, and view their order history.
 */

import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "./PersonalFields/SideBar";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor";
import PasswordManager from "./PersonalFields/PasswordManager";
import AddressManager from "./PersonalFields/AddressManager";
import WishlistComponent from "./PersonalFields/WishlistComponent";
import OrderHistory from "./PersonalFields/OrdersHistory";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

/**
 * @function PersonalArea
 * @description Main component for the personal area of a user.
 * @param {Object} props - Component properties.
 * @param {string} props.userId - The ID of the user.
 * @param {function} props.addToWishlist - Function to add/remove an item to the wishlist.
 * @param {function} props.addToCart - Function to add an item to the cart.
 * @param {string} props.token - The authentication token for API requests.
 */
const PersonalArea = ({ userId, addToWishlist, addToCart, token }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("details");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // This function fetches the user data from the API and updates the state.
  // It handles loading state and errors, and uses the provided userId to fetch the correct user.
  // If the user is not authenticated (401), it will not update the user state.
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch user data from the API using the provided userId
      // The fetchWithTokenRefresh function handles token refresh if needed.
      const response = await fetchWithTokenRefresh(`/api/User/${userId}`);
      // If the response status is 401 (unauthorized), we simply return without updating the user state.
      // This is to prevent unauthorized access to user data.
      if (response.status === 401) {
        return;
      }
      // If the response is not ok, throw an error to be caught in the catch block.
      if (!response.ok) throw new Error("Failed to fetch user");
      // Parse the response data as JSON and update the user state.
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err.message);
    } finally {
      // Regardless of success or failure, we set the loading state to false.
      // This ensures that the loading spinner is removed once the fetch operation is complete.
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

  // This function handles saving the updated user data to the API.
  // It sends a PUT request to the API with the updated user data.
  const handleSave = async (updatedUser) => {
    //try-catch block to handle errors during the API request.
    try {
      //try to send a PUT request to the API to update the user data.
      // The fetchWithTokenRefresh function is used to handle token refresh if needed.
      const response = await fetchWithTokenRefresh(`/api/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      // If the response status is 401 (unauthorized), we simply return without updating the user state.
      // This is to prevent unauthorized access to user data.
      if (response.status === 401) return;
      // If the response is not ok, throw an error to be caught in the catch block.
      // This ensures that we handle any errors that occur during the API request.
      if (!response.ok) throw new Error("Failed to update user");

      // If the request is successful, parse the response data as JSON and update the user state.
      // This updates the user state with the new data returned from the API.
      const updatedData = await response.json();
      setUser(updatedData);
    } catch (err) {
      // If an error occurs during the API request, catch it and log the error message.
      // Additionally, we can show an alert to the user indicating that the update failed.
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  // if the component is still loading, we display a loading spinner.
  // This is to ensure that the user sees a visual indication that data is being fetched.
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
  // If the user is authenticated, we render the personal area with the sidebar and main content.
  // The sidebar allows the user to navigate between different views
  //  (details, addresses, password, wishlist, orders).
  // The main content displays the selected view based on the currentView state.
  return user ? (
    <div className="bg-gray-100 min-h-screen ">
      <div className="container mx-auto py-8 px-4 lg:px-0">
        <div className="lg:grid lg:grid-cols-12 gap-6 h-full">
          {/* Sidebar for navigation
            The sidebar is conditionally rendered based on the isSidebarOpen state.
            The button toggles the sidebar visibility on smaller screens. */}
          <aside className="lg:col-span-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden mb-4 text-xl font-bold bg-primaryColor text-white py-2 px-4 rounded-md w-full">
              <h1>{t("personal_area.toggleMenu")}</h1>
            </button>
            <div
              className={`lg:block ${
                isSidebarOpen ? "block" : "hidden"
              } bg-white shadow-lg rounded-full mb-2 lg:rounded-full`}>
              <Sidebar
                currentView={currentView}
                onViewChange={(view) => {
                  setCurrentView(view);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </aside>

          {/* Main content area where the selected view is displayed */}
          {/* The main content area is responsive and adjusts based on the current view selected in the sidebar */}
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
