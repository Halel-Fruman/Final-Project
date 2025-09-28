import { fetchWithTokenRefresh } from "../utils/authHelpers";

/**
 * @function fetchCart
 * @description Fetches the user's cart from the server.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The user's cart items.
 */
export const fetchCart = async (userId, token) => {
  try {
    const response = await fetchWithTokenRefresh(`/api/User/${userId}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    return [];
  }
};

/**
 * @function saveCart
 * @description Saves the user's cart to the server.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @param {Array} cartItems - The items to be saved in the cart.
 */
export const saveCart = async (userId, token, cartItems) => {
  try {
    if (cartItems.length === 0) {
      return;
    }

    const response = await fetchWithTokenRefresh(`/api/User/${userId}/cart`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cartItems),
    });

    if (!response.ok) {
      throw new Error("Failed to update cart.");
    }

  } catch (error) {
    console.error("Error saving cart:", error.message);
  }
};
/**
 * @function addToCart
 * @description Adds a product to the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @param {Object} product - The product to be added, containing productId and quantity.
 * @returns {Promise<Object>} The updated cart item or null if an error occurs.
 */
export const addToCart = async (userId, token, product) => {
  try {
    const response = await fetchWithTokenRefresh(`/api/User/${userId}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.productId,
        quantity: product.quantity,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add to cart.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    return null;
  }
};

/**
 * @function removeFromCart
 * @description Removes a product from the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @param {string} productId - The ID of the product to be removed.
 * @returns {Promise<Object>} The updated cart item or null if an error occurs.
 */
export const removeFromCart = async (userId, token, productId) => {
  try {
    const response = await fetchWithTokenRefresh(`/api/User/${userId}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove item from cart.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    return null;
  }
};

/**
 * @function updateCartItemQuantity
 * @description Updates the quantity of a product in the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The authentication token.
 * @param {string} productId - The ID of the product to be updated.
 * @param {number} quantity - The new quantity of the product.
 * @returns {Promise<Object>} The updated cart item or null if an error occurs.
 */
export const updateCartItemQuantity = async (
  userId,
  productId,
  quantity,
  token
) => {
  try {
    const res = await fetchWithTokenRefresh(
      `/api/User/${userId}/cart/update-quantity`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update cart quantity");
    }

    return await res.json();
  } catch (err) {
    console.error("Error updating cart quantity:", err.message);
    throw err;
  }
};

/**
 * @function calculateCartTotal
 * @description Calculates the total price of items in the cart.
 * @param {Array} cartItems - The items in the cart, each with a price and quantity.
 * @returns {number} The total price of the cart items.
 */
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

/**
 * @function fetchProductDetails
 * @description Fetches details of a specific product by its ID.
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<Object|null>} The product details or null if an error occurs.
 */
export const fetchProductDetails = async (productId) => {
  if (!productId) {
    console.error("fetchProductDetails called with undefined productId");
    return null;
  }

  try {
    const response = await fetch(`/api/Products/${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product details.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    return null;
  }
};
