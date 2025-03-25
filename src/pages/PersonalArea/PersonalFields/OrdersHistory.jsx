// OrderHistory.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const OrderHistory = ({ user, addToCart }) => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const results = await Promise.all(
          user.transactions.map(async (transactionId) => {
            const res = await fetch(`http://localhost:5000/Transactions/by-id/${transactionId}`);
            const transaction = await res.json();
            return transaction;
          })
        );
        setTransactions(results.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };

    if (user.transactions?.length) {
      fetchTransactions();
    }
  }, [user.transactions]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const detailsMap = {};
      for (const tx of transactions) {
        for (const product of tx.products) {
          const id = product.productId;
          if (!detailsMap[id]) {
            try {
              const res = await fetch(`http://localhost:5000/Products/${id}`);
              const data = await res.json();
              detailsMap[id] = data;
            } catch {
              detailsMap[id] = null;
            }
          }
        }
      }
      setProductDetails(detailsMap);
    };

    if (transactions.length > 0) {
      fetchProductDetails();
    }
  }, [transactions]);

  return (
    <div className="w-10/12 mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">{t("orders.title")}</h1>
      <h2 className="text-lg text-gray-600 mb-12 text-center">{t("orders.subtitle")}</h2>

      {transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <div key={index} className="border rounded-lg shadow-sm mb-12 bg-white w-full">
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 px-6 py-4 text-xl text-gray-900 border-b">
              <div>{t("orders.order")} #{transaction.transactionId}</div>
              <div>{t("orders.date")}: {new Date(transaction.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6 text-lg text-gray-800">
                <p>{t("orders.store")}: <span className="font-medium">{transaction.storeName}</span></p>
                <p>{t("orders.total")}: <span className="font-medium">₪{transaction.totalAmount}</span></p>
                <p>{t("orders.status")}: <span className="font-medium">{t(`status.${transaction.delivery?.deliveryStatus || "pending"}`)}</span></p>
              </div>
              <button className="mt-4 text-xl font-bold text-blue-600 underline hover:text-blue-800">
                {t("orders.viewInvoice")}
              </button>
            </div>

            <div className="divide-y px-6 pb-6">
              {transaction.products.map((item, i) => {
                const fullProduct = productDetails[item.productId];
                const image = fullProduct?.images?.[0] || "https://placehold.co/100";
                const highlights = fullProduct?.highlight?.[i18n.language] || [];

                return (
                  <div key={i} className="flex flex-col md:flex-row items-start gap-6 py-6">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-28 h-28 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-3 text-md text-gray-700 mb-2">
                        {highlights.map((h, idx) => (
                          <span key={idx} className="bg-gray-100 px-3 py-1 rounded-md">{h}</span>
                        ))}
                      </div>
                      <p className="text-md text-gray-700 mb-1">{t("orders.quantity")}: {item.quantity}</p>
                      <p className="text-lg font-medium text-gray-900">₪{item.price}</p>
                    </div>
                    <div className="flex flex-col gap-2 justify-start">
                      <button
                        onClick={() => {
                            addToCart({ productId: item.productId, quantity: 1 });
                            toast.success(t("wishlist.addToCart") + " ✅");
                          }}
                      className="bg-primaryColor text-white text-xl font-bold px-4 py-2 rounded-md hover:bg-secondaryColor">
                        {t("orders.buyAgain")}
                      </button>
                      <button className="border border-gray-300 text-md px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                        {t("orders.shopSimilar")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center text-lg">{t("orders.noOrders")}</p>
      )}
    </div>
  );
};

export default OrderHistory;
