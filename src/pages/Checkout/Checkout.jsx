// File: CheckoutPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const CheckoutPage = ({ cartItems = [], fetchProductDetails }) => {
  const { t, i18n } = useTranslation();
  const [detailedCart, setDetailedCart] = React.useState([]);

  React.useEffect(() => {
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

  const total = detailedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="w-11/12 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-center text-gray-900 mb-2">
        {t("checkout.title")}
      </h1>
      <p className="text-xl text-gray-600 mb-10 text-center">
        {t("checkout.subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">{t("checkout.contactInformation")}</h2>
          <input
            placeholder={t("checkout.email")}
            className="w-full border rounded-md p-2"
          />

          <h3 className="text-xl font-semibold">{t("checkout.shippingAddress")}</h3>
          <input
            placeholder={t("checkout.address")}
            className="w-full border rounded-md p-2"
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              placeholder={t("checkout.city")}
              className="border p-2 rounded-md"
            />
            <input
              placeholder={t("checkout.state")}
              className="border p-2 rounded-md"
            />
            <input
              placeholder={t("checkout.zip")}
              className="border p-2 rounded-md"
            />
          </div>

          <h3 className="text-xl font-semibold">{t("checkout.paymentDetails")}</h3>
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

          <button className="w-full bg-primaryColor text-white py-2 rounded-md font-bold hover:bg-secondaryColor">
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
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.images?.[0] || "https://placehold.co/60"}
                    alt={item.name?.[i18n.language]}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.name?.[i18n.language]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("checkout.quantity")}: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-lg text-primaryColor">
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
    </div>
  );
};

export default CheckoutPage;
