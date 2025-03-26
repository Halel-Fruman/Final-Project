// CheckoutPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const CheckoutPage = ({ cartItems, totalAmount, onCheckout }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="w-10/12 mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        {t("cart.title")}
      </h1>
      <h2 className="text-lg text-gray-600 mb-12 text-center">
        {t("cart.subtitle") || t("cart.shipping")}
      </h2>

      {cartItems?.length > 0 ? (
        <>
          <div className="divide-y bg-white rounded-lg shadow-sm mb-8">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start gap-6 py-6 px-6"
              >
                <img
                  src={item.image || "https://placehold.co/100"}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-md text-gray-700 mb-2">
                    {item.highlight?.[i18n.language]?.map((h, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 px-3 py-1 rounded-md"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <p className="text-md text-gray-700 mb-1">
                    {t("cart.quantity")}: {item.quantity}
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    ₪{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right text-xl font-semibold text-gray-800 mb-6">
            {t("cart.subtotal")}: ₪{totalAmount}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onCheckout}
              className="bg-primaryColor hover:bg-secondaryColor text-white font-bold py-3 px-6 rounded-md text-xl"
            >
              {t("cart.checkout")}
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-center text-lg">{t("cart.empty")}</p>
      )}
    </div>
  );
};

export default CheckoutPage;
