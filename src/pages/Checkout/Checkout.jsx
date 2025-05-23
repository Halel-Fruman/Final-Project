// File: CheckoutPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { addAddress } from "../../utils/Address";
import { processCheckout } from "../../utils/checkoutHandler";
import { useNavigate } from "react-router-dom";
import { set } from "mongoose";
import { Icon } from "@iconify/react";
import { updateCartItemQuantity } from "../../utils/Cart";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";
const CheckoutPage = ({
  cartItems = [],
  fetchProductDetails,
  userId,
  token,
  addToCart,
  setCartItems,
  removeFromCart,
}) => {
  const { t, i18n } = useTranslation();
  const [detailedCart, setDetailedCart] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newAddress, setNewAddress] = useState({ city: "", streetAddress: "" });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [startPayment, setStartPayment] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState({});
  const [storeShippingInfo, setStoreShippingInfo] = useState({});
  const [isFinalizing, setIsFinalizing] = useState(false);

  const navigate = useNavigate();

  const selectedAddress = userData?.addresses?.[selectedAddressIndex];

  // Fetch product details for each item in the cart
  // and set the detailed cart state
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

  // Handle payment success message from Tranzila
  // and process the checkout
  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.type === "TRZILA_PAYMENT_SUCCESS") {
        (async () => {
          try {
            setIsFinalizing(true); // ⬅️ התחלת טעינה

            const res = await fetch(`/api/tranzila/notify/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch notify info");
            const notifyData = await res.json();

            const transactions = await processCheckout({
              cartItems: detailedCart,
              userData,
              transactionId: notifyData.index,
              selectedAddress,
              deliveryMethods,
              token,
              setCartItems,
            });

            navigate("/confirmation", {
              state: { transactions, detailedCart, deliveryMethods },
            });
          } catch (err) {
            console.error("❌ Error during post-payment processing:", err);
            alert("שגיאה בעת השלמת ההזמנה");
          } finally {
            setIsFinalizing(false); // ⬅️ סיום טעינה
          }
        })();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    detailedCart,
    userData,
    selectedAddress,
    deliveryMethods,
    token,
    userId,
    navigate,
  ]);

  // Tranzila Iframe component
  // This component creates a payment session with Tranzila
  const TranzilaIframe = ({
    sum,
    userId,
    cartItems,
    selectedAddress,
    userData,
    deliveryMethods,
    storeShippingInfo,
  }) => {
    const [formHtml, setFormHtml] = useState(null);
    const groupedByStore = detailedCart.reduce((acc, item) => {
      const storeId = item.storeId;
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(item);
      return acc;
    }, {});

    // Calculate the total sum of the cart items
    useEffect(() => {
      const createPaymentSession = async () => {
        try {
          const cartDetails = [];

          Object.entries(groupedByStore).forEach(([storeId, products]) => {
            products.forEach((item) => {
              cartDetails.push({
                product_name: item.name?.[i18n.language] || "Product",
                product_quantity: item.quantity,
                product_price: item.price,
              });
            });

            const method = deliveryMethods[storeId];
            const shipping = storeShippingInfo[storeId];
            console.log(method);
            let price = 0;
            let company = "";
            let deliveryMethod = "";
            if (method === "courier") {
              price = shipping?.homeDelivery?.price || 0;
              company = shipping?.homeDelivery?.company || "";
              deliveryMethod = t("checkout.deliveryMethods.courier");
            } else if (method === "pickupPoint") {
              price = shipping?.pickupPoint?.price || 0;
              company = shipping?.pickupPoint?.company || "";
              deliveryMethod = t("checkout.deliveryMethods.delivery_box");
            } else {
              price = 0;
              company = t("checkout.deliveryMethods.pickup");
              deliveryMethod = t("checkout.deliveryMethods.pickupFromStore");
            }

            cartDetails.push({
              product_name: `${deliveryMethod} - ${company}`,
              product_quantity: 1,
              product_price: price,
            });
          });

          const res = await fetch("/api/tranzila/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sum,
              userId,
              selectedAddress,
              customer: {
                fullName: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                phone: userData.phoneNumber,
              },
              cartDetails,
            }),
          });

          const html = await res.text();
          setFormHtml(html);
        } catch (error) {
          console.error("Failed to create Tranzila payment iframe", error);
        }
      };

      createPaymentSession();
    }, [sum, userId, cartItems, selectedAddress, userData]);

    // Render the Tranzila iframe
    // If formHtml is not available, show a loading spinner
    if (!formHtml)
      return (
        <div className="flex justify-center items-center py-12">
          <Icon
            icon="eos-icons:loading"
            className="w-10 h-10 animate-spin text-primaryColor"
          />
        </div>
      );

    // Render the iframe with the payment form
    // The iframe is set to 100% width and height of its container
    return (
      <div className="w-full h-[350px] mt-8">
        <iframe
          title="Tranzila Secure Payment"
          srcDoc={formHtml}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="payment"></iframe>
      </div>
    );
  };

  // Fetch user data when the component mounts
  // and when the userId or token changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithTokenRefresh(`/api/User/${userId}`);
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  // Fetch shipping info for each store in the cart
  // and set the storeShippingInfo state

  useEffect(() => {
    const fetchShippingInfo = async () => {
      const stores = [...new Set(detailedCart.map((p) => p.storeId))];
      const result = {};
      for (let storeId of stores) {
        try {
          const res = await fetch(`/api/Stores/${storeId}/shipping-info`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const storeData = await res.json();
            result[storeId] = storeData || {};
          }
        } catch (e) {
          console.error("Error fetching shipping info for store", storeId);
        }
      }
      setStoreShippingInfo(result);
    };
    if (detailedCart.length > 0) fetchShippingInfo();
  }, [detailedCart, token]);

  // Set initial delivery methods for each store
  // based on the detailed cart items
  // If a store doesn't have a delivery method set, default to "pickupFromStore"
  useEffect(() => {
    if (detailedCart.length === 0) return;

    const initialMethods = {};
    const uniqueStoreIds = [
      ...new Set(detailedCart.map((item) => item.storeId)),
    ];
    uniqueStoreIds.forEach((storeId) => {
      if (!deliveryMethods[storeId]) {
        initialMethods[storeId] = "pickupFromStore";
      }
    });

    if (Object.keys(initialMethods).length > 0) {
      setDeliveryMethods((prev) => ({ ...prev, ...initialMethods }));
    }
  }, [detailedCart]);

  // Group the detailed cart items by storeId
  // This is used to display the items in the summary section
  // and to calculate the total price
  const groupedByStore = useMemo(() => {
    return detailedCart.reduce((acc, item) => {
      const storeId = item.storeId;
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(item);
      return acc;
    }, {});
  }, [detailedCart]);

  const total = useMemo(() => {
    let sum = 0;
    for (const [storeId, items] of Object.entries(groupedByStore)) {
      const itemsSum = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const method = deliveryMethods[storeId];
      const shipping = storeShippingInfo[storeId];

      let extra = 0;
      if (method === "pickupPoint") {
        extra = shipping?.pickupPoint?.price || 0;
      } else if (method === "courier") {
        extra = shipping?.homeDelivery?.price || 0;
      } // else if pickupFromStore, extra stays 0

      sum += itemsSum + extra;
    }
    return sum;
  }, [groupedByStore, deliveryMethods, storeShippingInfo]);

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

  return (
    <>
      {isFinalizing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
            <Icon
              icon="eos-icons:loading"
              className="w-8 h-8 animate-spin text-primaryColor"
            />
            <p className="text-lg font-semibold text-gray-700">
              {t("checkout.finalizingTransaction") || "מעבד הזמנה..."}
            </p>
          </div>
        </div>
      )}
      <main className="w-11/12 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-2">
          {t("checkout.title")}
        </h1>
        <p className="text-xl text-gray-600 mb-10 text-center">
          {t("checkout.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Section */}
          <div className="order-2 md:order-1 bg-white border rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("checkout.contactInformation")}
            </h2>

            <input
              value={`${userData?.first_name || ""} ${
                userData?.last_name || ""
              }`}
              disabled
              className="w-full border rounded-md p-2"
            />
            <input
              value={userData?.phoneNumber || ""}
              disabled
              className="w-full border rounded-md p-2"
            />
            <input
              value={userData?.email || ""}
              disabled
              className="w-full border rounded-md p-2"
            />

            <h3 className="text-xl font-semibold">
              {t("checkout.shippingAddress")}
            </h3>
            {userData?.addresses?.length > 1 && (
              <select
                className="w-full p-2 border rounded-md"
                value={selectedAddressIndex}
                onChange={(e) =>
                  setSelectedAddressIndex(Number(e.target.value))
                }>
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
                  value={selectedAddress?.city}
                  disabled
                  className="w-full border rounded-md p-2"
                />
                <input
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

            <button
              className="w-full bg-primaryColor text-xl text-white py-2 rounded-full font-bold hover:bg-secondaryColor"
              onClick={() => setStartPayment(true)}>
              {t("checkout.payNow")}
            </button>

            {startPayment && (
              <TranzilaIframe
                sum={total}
                userId={userId}
                cartItems={detailedCart}
                selectedAddress={selectedAddress}
                userData={userData}
                deliveryMethods={deliveryMethods}
                storeShippingInfo={storeShippingInfo}
              />
            )}
          </div>

          {/* Summary Section with delivery options */}
          <div className="order-1 md:order-2 border bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-right">
              {t("checkout.summary")}
            </h2>

            <div className=" overflow-y-auto space-y-6">
              {Object.entries(groupedByStore).map(([storeId, products]) => (
                <div key={storeId} className="border-b pb-4 space-y-4">
                  <h3 className="text-xl font-semibold text-right">
                    {products[0].storeName?.[i18n.language] || "Store"}
                  </h3>

                  {products.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between text-right border rounded p-2">
                      <img
                        src={item.images?.[0]}
                        alt={item.name?.[i18n.language]}
                        className="h-14 w-14 object-cover rounded ml-2"
                      />
                      <div className="text-sm text-gray-600 flex-1">
                        <div className="font-medium">
                          {item.name?.[i18n.language]}
                        </div>
                        <div className="flex items-center mt-1 space-x-2 rtl:space-x-reverse">
                          <span className="text-xs">
                            {t("checkout.quantity")}:
                          </span>
                          <button
                            onClick={async () => {
                              if (item.quantity > 1) {
                                await updateCartItemQuantity(
                                  userId,
                                  item.productId?._id || item.productId,
                                  item.quantity - 1,
                                  token
                                );
                                setDetailedCart((prev) =>
                                  prev.map((p) =>
                                    p._id === item._id
                                      ? { ...p, quantity: item.quantity - 1 }
                                      : p
                                  )
                                );
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                            -
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={async () => {
                              await updateCartItemQuantity(
                                userId,
                                item.productId?._id || item.productId,
                                item.quantity + 1,
                                token
                              );
                              setDetailedCart((prev) =>
                                prev.map((p) =>
                                  p._id === item._id
                                    ? { ...p, quantity: item.quantity + 1 }
                                    : p
                                )
                              );
                            }}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                            +
                          </button>
                          <button
                            onClick={async () => {
                              removeFromCart(
                                item.productId?._id || item.productId
                              );
                              setDetailedCart((prev) =>
                                prev.filter((p) => p._id !== item._id)
                              );
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title={t("checkout.remove")}>
                            {t("checkout.remove")}
                          </button>
                        </div>
                      </div>
                      <div className="text-md font-bold text-primaryColor ml-auto">
                        ₪{item.price}
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 text-right">
                    <label className="block font-semibold mb-1">
                      {t("checkout.deliveryMethods.selectDeliveryMethod")}:
                    </label>
                    {(() => {
                      const shipping = storeShippingInfo[storeId] || {};
                      const currentMethod =
                        deliveryMethods[storeId] || "courier";
                      const company =
                        currentMethod === "pickupPoint"
                          ? shipping.pickupPoint?.company
                          : shipping.homeDelivery?.company;
                      const price =
                        currentMethod === "pickupPoint"
                          ? shipping.pickupPoint?.price
                          : shipping.homeDelivery?.price;

                      return (
                        <>
                          <select
                            value={deliveryMethods[storeId] || ""}
                            onChange={(e) =>
                              setDeliveryMethods({
                                ...deliveryMethods,
                                [storeId]: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded">
                            <option value="pickupFromStore">
                              {t("checkout.deliveryMethods.pickup")} ( ₪0)
                            </option>
                            {storeShippingInfo[storeId]?.pickupPoint && (
                              <option value="pickupPoint">
                                {`${t(
                                  "checkout.deliveryMethods.delivery_box"
                                )} - ${
                                  storeShippingInfo[storeId].pickupPoint.company
                                } (₪${
                                  storeShippingInfo[storeId].pickupPoint.price
                                })`}
                              </option>
                            )}
                            {storeShippingInfo[storeId]?.homeDelivery && (
                              <option value="courier">
                                {`${t("checkout.deliveryMethods.courier")} - ${
                                  storeShippingInfo[storeId].homeDelivery
                                    .company
                                } (₪${
                                  storeShippingInfo[storeId].homeDelivery.price
                                })`}
                              </option>
                            )}
                          </select>

                          {currentMethod !== "pickupFromStore" && company && (
                            <div className="text-sm mt-2 text-gray-700">
                              {t("checkout.deliveryCompany")}: {company} |{" "}
                              {t("checkout.deliveryPrice")}: ₪{price}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t text-right text-xl font-bold text-gray-900">
              {t("checkout.subtotal")}: ₪{total.toFixed(2)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;
