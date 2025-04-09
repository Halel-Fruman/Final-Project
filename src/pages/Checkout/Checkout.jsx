// File: CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { addAddress } from "../../utils/Address"; // נתיב לפי הפרויקט שלך
import { processCheckout } from "../../utils/checkoutHandler";
import { useNavigate } from "react-router-dom";

const CheckoutPage = ({
  cartItems = [],
  fetchProductDetails,
  userId,
  token,
}) => {
  const { t, i18n } = useTranslation();
  const [detailedCart, setDetailedCart] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newAddress, setNewAddress] = useState({ city: "", streetAddress: "" });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDetails = async () => {
      const enriched = await Promise.all(
        cartItems.map(async (item) => {
          const productId = item.productId?._id || item.productId;
          const product = await fetchProductDetails(productId);
          return { ...item, ...product };
        })
      );
      setDetailedCart(enriched);
    };

    if (cartItems.length > 0) loadDetails();
  }, [cartItems, fetchProductDetails]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) fetchUser();
  }, [userId, token]);

  const total = detailedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedAddress = userData?.addresses?.[selectedAddressIndex];

  const handleAddNewAddress = async () => {
    try {
      const updatedAddresses = await addAddress({
        userId,
        token,
        address: newAddress,
      });
      setUserData((prev) => ({ ...prev, addresses: updatedAddresses }));
      setShowNewAddressForm(false);
      setNewAddress({ city: "", streetAddress: "" });
      setSelectedAddressIndex(updatedAddresses.length - 1);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const result = await processCheckout({
        cartItems: detailedCart,
        userData,
        selectedAddress,
        token,
      });

      // נווט לדף אישור ההזמנה עם פרטי העסקאות
      navigate("/confirmation", { state: { transactions: result, detailedCart } });
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("אירעה שגיאה במהלך ביצוע ההזמנה");
    }
  };

  return (
    <main className="w-11/12 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-center text-gray-900 mb-2">
        {t("checkout.title")}
      </h1>
      <p className="text-xl text-gray-600 mb-10 text-center">
        {t("checkout.subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("checkout.contactInformation")}
          </h2>

          <input
            value={`${userData?.first_name || ""} ${userData?.last_name || ""}`}
            placeholder={
              t("personal_area.firstName") + " " + t("personal_area.lastName")
            }
            disabled
            className="w-full border rounded-md p-2"
          />
          <input
            value={userData?.phoneNumber || ""}
            placeholder={t("personal_area.phone")}
            disabled
            className="w-full border rounded-md p-2"
          />
          <input
            value={userData?.email || ""}
            placeholder={t("checkout.email")}
            disabled
            className="w-full border rounded-md p-2"
          />

          <h3 className="text-xl font-semibold">
            {t("checkout.shippingAddress")}
          </h3>

          {userData?.addresses?.length > 1 && (
            <select
              className="w-full p-2 border rounded-md"
              aria-label="Select a shipping address"
              value={selectedAddressIndex}
              onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}>
              {userData.addresses.map((addr, i) => (
                <option key={i} value={i}>
                  {addr.city}, {addr.streetAddress}
                </option>
              ))}
            </select>
          )}

          {selectedAddress && !showNewAddressForm && (
            <>
              <input
                aria-label="City"
                value={selectedAddress?.city}
                disabled
                className="w-full border rounded-md p-2"
              />
              <input
                aria-label="Street Address"
                value={selectedAddress?.streetAddress}
                disabled
                className="w-full border rounded-md p-2"
              />
            </>
          )}

          {showNewAddressForm && (
            <>
              <input
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                placeholder={t("checkout.city")}
                className="w-full border rounded-md p-2"
              />
              <input
                value={newAddress.streetAddress}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    streetAddress: e.target.value,
                  })
                }
                placeholder={t("checkout.address")}
                className="w-full border rounded-md p-2"
              />
              <button
                className="text-lg m-2 text-blue-800 border-b border-blue-800"
                onClick={handleAddNewAddress}>
                {t("checkout.saveNewAddress")}
              </button>
            </>
          )}

          <button
            className="text-lg text-blue-800 border-b border-blue-800"
            onClick={() => setShowNewAddressForm(!showNewAddressForm)}>
            {showNewAddressForm
              ? t("checkout.cancelNewAddress")
              : t("checkout.addNewAddress")}
          </button>

          <h3 className="text-xl font-semibold">
            {t("checkout.paymentDetails")}
          </h3>
          <input
            placeholder={t("checkout.cardNumber")}
            className="w-full border rounded-md p-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder={t("checkout.expiry")}
              className="border rounded-md p-2"
            />
            <input
              placeholder={t("checkout.cvc")}
              className="border rounded-md p-2"
            />
          </div>

          <button
            className="w-full bg-primaryColor text-xl text-white py-2 rounded-md font-bold hover:bg-secondaryColor"
            onClick={handleCheckout}>
            {t("checkout.payNow")}
          </button>
        </div>

        {/* Summary Section */}
        <div className="bg-white p-8 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-6">{t("checkout.summary")}</h2>
          <div className="space-y-4">
            {detailedCart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={item.images?.[0] || "https://placehold.co/60"}
                    alt={item.name?.[i18n.language]}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-lg text-gray-900">
                      {item.name?.[i18n.language]}
                    </p>
                    <p className="text-base text-gray-700">
                      {t("checkout.quantity")}: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-xl text-primaryColor">
                  ₪{item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 text-right text-lg font-semibold text-gray-900">
            {t("checkout.subtotal")}: ₪{total.toFixed(2)}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
