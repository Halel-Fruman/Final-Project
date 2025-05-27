import { fetchWithTokenRefresh } from "../utils/authHelpers";

// קריאת עגלה
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

// שמירת עגלה
export const saveCart = async (userId, token, cartItems) => {
  try {
    if (cartItems.length === 0) {
      console.log("Cart is empty. Skipping save.");
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

    console.log("Cart updated successfully.");
  } catch (error) {
    console.error("Error saving cart:", error.message);
  }
};

// הוספה לעגלה
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

// הסרה מהעגלה
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

// עדכון כמות
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

// חישוב סה״כ
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// שליפת פרטי מוצר (ציבורי - לא צריך refresh)
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
