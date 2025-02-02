// function to fetch wishlist from server
export const fetchWishlist = async (userId, token) => {
  // send a GET request to the server to fetch the wishlist items
  try {
    // send the request to the server
    const response = await fetch(
      `http://localhost:5000/User/${userId}/wishlist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // if the response is not ok, throw an error
    if (!response.ok) {
      throw new Error("Failed to fetch wishlist");
    }
    // parse the response body as JSON
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    return [];
  }
};
// function to update the wishlist
export const updateWishlist = async (userId, token, product, isInWishlist) => {
  // send a POST request to add a product to the wishlist or a DELETE request to remove it
  try {
    // determine the HTTP method based on whether the product is already in the wishlist
    const method = isInWishlist ? "DELETE" : "POST";
    // send the request to the server
    const response = await fetch(
      `http://localhost:5000/User/${userId}/wishlist`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      }
    );
    // if the response is not ok, throw an error
    if (!response.ok) {
      throw new Error(
        `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
      );
    }
    return true; // update successful
  } catch (error) {
    console.error("Error updating wishlist:", error.message);
    return false; // update failed
  }
};
