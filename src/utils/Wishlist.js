import { fetchWithTokenRefresh } from "../utils/authHelpers";
/**
 * @function fetchWishlist
 * @description Fetches the user's wishlist from the server.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The user's wishlist items.
 */
export const fetchWishlist = async (userId, token) => {
  try {
    const response = await fetchWithTokenRefresh(
      `/api/User/${userId}/wishlist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch wishlist");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    return [];
  }
};

/**
 * @function updateWishlist
 * @description Adds or removes a product from the user's wishlist.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @param {Object} product - The product to be added or removed, containing productId.
 * @param {boolean} isInWishlist - Indicates whether the product is currently in the wishlist.
 * @returns {Promise<boolean>} True if the operation was successful, false otherwise.
 */
export const updateWishlist = async (userId, token, product, isInWishlist) => {
  try {
    const method = isInWishlist ? "DELETE" : "POST";

    const response = await fetchWithTokenRefresh(
      `/api/User/${userId}/wishlist`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
      );
    }
    return true;
  } catch (error) {
    console.error("Error updating wishlist:", error.message);
    return false;
  }
};
