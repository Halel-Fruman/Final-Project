export const processCheckout = async ({
  cartItems,
  userData,
  selectedAddress,
  deliveryMethod = "courier",
  token,
}) => {
  if (!userData || !selectedAddress) {
    throw new Error("User data or selected address missing");
  }

  const groupedByStore = {};
  cartItems.forEach((item) => {
    const storeId = item.storeId?._id || item.storeId;
    if (!groupedByStore[storeId]) {
      groupedByStore[storeId] = {
        storeId,
        storeName: item.storeName,
        storeEmail: item.storeEmail,
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
  });

  const transactionId = generateTransactionId();
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
        deliveryMethod,
        deliveryStatus: "pending",
      },
    };

    // הוסף עסקה לחנות
    const storeRes = await fetch("http://localhost:5000/Transactions/add", {
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

    // הוסף עסקה למשתמש
    const userRes = await fetch(
      `http://localhost:5000/User/${userData._id}/add-transaction`,
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

    // שלח מייל למשתמש ולחנות
    await fetch("http://localhost:5000/email/send-confirmation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: userData.email,
        userName: commonBuyerDetails.fullName,
        storeEmail: storeData.storeEmail, // ודא שהשדה הזה קיים בפריט
        storeName: storeData.storeName,
        transaction,
      }),
    });

    results.push({ transaction, storeId: storeData.storeId, storeName: storeData.storeName });
  }

  return results;
};

function generateTransactionId() {
  return "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}
