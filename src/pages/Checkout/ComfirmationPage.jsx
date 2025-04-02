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
        <h2 className="text-2xl font-bold">
          {t("confirmation.noTransactions")}
        </h2>
        <button
          className="mt-4 px-4 py-2 bg-primaryColor text-white rounded"
          onClick={() => navigate("/")}>
          {t("confirmation.backHome")}
        </button>
      </div>
    );
  }

  const groupedByTransactionId = transactions.reduce((acc, tx) => {
    const txId = tx.transaction.transactionId;
    if (!acc[txId]) acc[txId] = [];
    acc[txId].push(tx);
    return acc;
  }, {});

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-primaryColor">
        {t("confirmation.title")}
      </h1>
      <h2 className="text-center text-gray-700 mb-4">
        {t("confirmation.successMessage")}
      </h2>

      {Object.entries(groupedByTransactionId).map(([txId, group], groupIdx) => (
        <div
          key={groupIdx}
          className="mb-10 border border-secondaryColor rounded-lg shadow-md">
          <div className="bg-primaryColor bg-opacity-10 px-4 py-3 text-xl font-bold text-primaryColor border-b border-secondaryColor">
            {t("orders.orderGroup")}: <span className="font-mono">{txId}</span>
          </div>

          {group.map(({ transaction, storeId, storeName }, index) => (
            <div key={index} className="p-6 border-b last:border-b-0">
              <div className="flex flex-col md:flex-row justify-between text-gray-700 mb-3 text-sm">
                <p>
                  <strong>{t("orders.store")}:</strong>{" "}
                  {storeName || t("confirmation.unknownStore")}
                </p>
                <p>
                  <strong>{t("confirmation.orderId")}:</strong>{" "}
                  {transaction.orderId}
                </p>

                <p>
                  <strong>{t("orders.status")}:</strong>{" "}
                  {t(
                    `status.${
                      transaction.delivery?.deliveryStatus || "pending"
                    }`
                  )}
                </p>
              </div>

              <div className="grid gap-4 mt-4">
                {transaction.products.map((product, idx) => {
                  const matchedProduct = detailedCart.find(
                    (item) =>
                      item._id === product.productId &&
                      (item.storeId?._id || item.storeId) === storeId
                  );

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 border-b pb-2">
                      <img
                        src={
                          matchedProduct?.images?.[0] ||
                          "https://placehold.co/60"
                        }
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

              {/* <div className="text-right mt-4 text-xl font-bold text-primaryColor">
                {t("checkout.subtotal")}: ₪{transaction.totalAmount.toFixed(2)}
              </div> */}
            </div>
          ))}
          <div className="text-right m-4 font-bold text-2xl text-primaryColor">
            {t("confirmation.totalSum")}: ₪
            {group.reduce((sum, tx) => sum + tx.transaction.totalAmount, 0).toFixed(2)}
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
