// utils/Cart.js

import { stringify } from "postcss";

// טעינת עגלה מהדאטה בייס
export const fetchCart = async (userId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cart.");
    }

    const cartData = await response.json();
    return Array.isArray(cartData) ? cartData : [];
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    return [];
  }
};


  // שמירת עגלה בדאטה בייס
  export const saveCart = async (userId, token, cartItems) => {
    try {
      if (cartItems.length === 0) {
        console.log("Cart is empty. Skipping save.");
        return;
      }

      const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
        method: "PUT", // עדכון כמות או שמירת פריטים קיימים
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify( cartItems),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart.");
      }

      console.log("Cart updated successfully.");
    } catch (error) {
      console.error("Error saving cart:", error.message);
    }
  };




  export const addToCart = async (userId, token, product) => {
    console.log("Product being sent to cart:", { productId: product.productId });

    try {
        const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: product.productId }),
        });

        if (!response.ok) {
            throw new Error("Failed to add to cart.");
        }

        const updatedCart = await response.json();
        return updatedCart;
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        return null;
    }
};


  // הסרת פריט מהעגלה
  export const removeFromCart = async (userId, token, productId) => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId:productId,
          quantity: 1
         }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart.");
      }

      const updatedCart = await response.json();
      return updatedCart; // החזרת עגלה מעודכנת
    } catch (error) {
      console.error("Error removing item from cart:", error.message);
      return null;
    }
  };


  // חישוב סה"כ העגלה
  export const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  export const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/Example_products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product details.");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product details:", error.message);
      return null;
    }
  };

