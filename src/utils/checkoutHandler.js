import { fetchWithTokenRefresh } from "../utils/authHelpers";

// Function to fetch store email by store ID
export async function fetchStoreEmail(storeId) {
  try {
    const res = await fetch(`/api/Stores/${storeId}/Email`);
    if (!res.ok) throw new Error("Failed to fetch store email");

    const data = await res.json();
    return data.email;
  } catch (err) {
    console.error("Error fetching store email:", err.message);
    return null;
  }
}

// Main function to process the checkout
// This function groups cart items by store, prepares transaction data, and sends it to the server
// It also handles sending confirmation emails and clearing the cart after successful checkout
export const processCheckout = async ({
  cartItems,
  userData,
  transactionId,
  selectedAddress,
  deliveryMethods,
  token,
  setCartItems,
}) => {
  if (!userData || !selectedAddress) {
    throw new Error("User data or selected address missing");
  }

  const groupedByStore = {};

await Promise.all(
  cartItems.map(async (item) => {
    const storeId = item.storeId?._id || item.storeId;

    const storeEmail =
      item.storeEmail || (await fetchStoreEmail(storeId)) || "noemail@yourdomain.com";

    if (!groupedByStore[storeId]) {
      groupedByStore[storeId] = {
        storeId,
        storeName: item.storeName,
        storeEmail,
        deliveryMethod: deliveryMethods[storeId],
        products: [],
        totalAmount: 0,
      };
    }

    groupedByStore[storeId].products.push({
      productId: item._id,
      name: item.name.he,
      price: item.price,
      quantity: item.quantity,
    });

    groupedByStore[storeId].totalAmount += item.price * item.quantity;
  })
);

  const commonBuyerDetails = {
    fullName: `${userData.first_name} ${userData.last_name}`,
    phone: userData.phoneNumber,
    email: userData.email,
    address: `${selectedAddress.city}, ${selectedAddress.streetAddress}`,
  };

  const results = [];

  for (const storeData of Object.values(groupedByStore)) {
    const transaction = {
      transactionId,
      userId: userData._id,
      status: "pending",
      totalAmount: storeData.totalAmount,
      buyerDetails: commonBuyerDetails,
      products: storeData.products,
      delivery: {
        deliveryMethod: storeData.deliveryMethod,
        deliveryStatus: "pending",
      },
    };

    const storeRes = await fetchWithTokenRefresh("/api/Transactions/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId: storeData.storeId,
        storeName: storeData.storeName,
        transaction,
      }),
    });

    if (!storeRes.ok) throw new Error("Failed to add transaction to store");
    const { newTransaction } = await storeRes.json();
    await Promise.all(
  storeData.products.map(async (product) => {
    const res = await fetchWithTokenRefresh(
      `/api/Products/${product.productId}/decrease-stock`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: product.quantity }),
      }
    );

    if (!res.ok) {
      console.error(`Failed to update stock for product ${product.productId}`);
    }
  })
);

    const userRes = await fetchWithTokenRefresh(
      `/api/User/${userData._id}/add-transaction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      }
    );
    if (!userRes.ok) throw new Error("Failed to add transaction to user");

    await fetchWithTokenRefresh("/api/email/send-confirmation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: userData.email,
        userName: commonBuyerDetails.fullName,
        storeEmail: storeData.storeEmail,
        storeName: storeData.storeName,
        transaction: newTransaction,
      }),
    });

    results.push({
      transaction: newTransaction,
      storeId: storeData.storeId,
      storeName: storeData.storeName,
    });
  }

  await fetchWithTokenRefresh(`/api/User/${userData._id}/clear-cart`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  localStorage.removeItem("cart");
  setCartItems([]);

  return results;
};
