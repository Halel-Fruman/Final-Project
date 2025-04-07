// utils/Cart.js

// login function to send a POST request to the server with the email and password
export const fetchCart = async (userId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
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

// saveCart function to send a PUT request to the server with the updated cart items
export const saveCart = async (userId, token, cartItems) => {
  try {
    if (cartItems.length === 0) {
      console.log("Cart is empty. Skipping save.");
      return;
    }
    // send a PUT request to the server with the updated cart items
    const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
      method: "PUT", // update the cart
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
// add product to cart function to send a POST request to the server with the product ID
export const addToCart = async (userId, token, product) => {
  try {
    // send a POST request to the server with the product ID
    const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({ productId: product.productId , quantity: product.quantity}),

    });
    // if the response is not ok, throw an error
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

// remove product from cart
export const removeFromCart = async (userId, token, productId) => {
  console.log("Removing product from cart:", { productId });
  // send a DELETE request to the server to remove the product from the cart
  try {
    const response = await fetch(`http://localhost:5000/User/${userId}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: productId, quantity: 1 }),
    });
    //  if the response is not ok, throw an error
    if (!response.ok) {
      throw new Error("Failed to remove item from cart.");
    }
    // return the updated cart
    const updatedCart = await response.json();
    return updatedCart;
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    return null;
  }
};
// utils/cartHelpers.js

export const updateCartItemQuantity = async (userId, productId, quantity, token) => {
  try {
    const res = await fetch(`http://localhost:5000/User/${userId}/cart/update-quantity`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      throw new Error("Failed to update cart quantity");
    }

    const data = await res.json();
    return data; // מחזיר את העגלה המעודכנת
  } catch (err) {
    console.error("Error updating cart quantity:", err.message);
    throw err;
  }
};


// calculate the total price of the cart
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
// fetch the product details from the server
export const fetchProductDetails = async (productId) => {
  if (!productId) {
    console.error("fetchProductDetails called with undefined productId");
    return null;
  }
  // fetch the product details from the server
  try {
    const response = await fetch(`http://localhost:5000/Products/${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product details.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    return null;
  }
};
