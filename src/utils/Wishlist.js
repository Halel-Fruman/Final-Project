import { fetchWithTokenRefresh } from "../utils/authHelpers";

// fetch wishlist from server
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

// update wishlist
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
