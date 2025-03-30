// File: ConfirmationPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const transactions = state?.transactions || [];
  const detailedCart = state?.detailedCart || [];

  if (!transactions.length) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">{t("confirmation.noTransactions")}</h2>
        <button
          className="mt-4 px-4 py-2 bg-primaryColor text-white rounded"
          onClick={() => navigate("/")}>
          {t("confirmation.backHome")}
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-primaryColor">
        {t("confirmation.title")}
      </h1>
      <p className="text-center text-gray-700 mb-10">
        {t("confirmation.successMessage")}
      </p>

      {transactions.map(({ transaction, storeId, storeName }, index) => (
        <div key={index} className="mb-8 p-4 border rounded shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">
            {t("confirmation.store")}: {storeName || t("confirmation.unknownStore")}
          </h2>
          <p className="text-gray-700 mb-2">
            {t("confirmation.transactionId")}: {transaction.transactionId}
          </p>
          <p className="text-gray-700 mb-2">
            {t("confirmation.deliveryMethod")}: {t(`checkout.deliveryMethods.${transaction.delivery.deliveryMethod}`)}
          </p>
          <div className="grid gap-4 mt-4">
            {transaction.products.map((product, idx) => {
              const matchedProduct = detailedCart.find(
                (item) =>
                  item._id === product.productId &&
                  (item.storeId?._id || item.storeId) === storeId
              );

              return (
                <div key={idx} className="flex items-center gap-4 border-b pb-2">
                  <img
                    src={matchedProduct?.images?.[0] || "https://placehold.co/60"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-lg">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {t("checkout.quantity")}: {product.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("price")}: ₪{product.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-right mt-4 font-semibold">
            {t("checkout.subtotal")}: ₪{transaction.totalAmount.toFixed(2)}
          </div>
        </div>
      ))}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 bg-primaryColor text-white text-xl font-bold rounded-md hover:bg-secondaryColor">
          {t("confirmation.viewOrders")}
        </button>
      </div>
    </main>
  );
};

export default ConfirmationPage;
