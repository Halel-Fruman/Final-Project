// File: OrderHistory.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const OrderHistory = ({ user, addToCart }) => {
  const { t, i18n } = useTranslation();
  const [transactionGroups, setTransactionGroups] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchGroupedTransactions = async () => {
      try {
        const groups = {};
        for (const txId of user.transactions) {
          const res = await fetch(
            `http://localhost:5000/Transactions/by-transactionId/${txId}`
          );
          if (res.ok) {
            const txs = await res.json();
            if (txs?.length) {
              groups[txId] = txs;
            }
          }
        }
        setTransactionGroups(groups);
      } catch (err) {
        console.error("Failed to fetch grouped transactions:", err);
      }
    };

    if (user.transactions?.length) {
      fetchGroupedTransactions();
    }
  }, [user.transactions]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const allProducts = {};
      Object.values(transactionGroups)
        .flat()
        .forEach((tx) => {
          tx.products.forEach((p) => (allProducts[p.productId] = true));
        });

      const detailsMap = {};
      for (const id of Object.keys(allProducts)) {
        try {
          const res = await fetch(`http://localhost:5000/Products/${id}`);
          const data = await res.json();
          detailsMap[id] = data;
        } catch {
          detailsMap[id] = null;
        }
      }
      setProductDetails(detailsMap);
    };

    if (Object.keys(transactionGroups).length) {
      fetchProductDetails();
    }
  }, [transactionGroups]);

  return (
    <div className="w-10/12 mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        {t("orders.title")}
      </h1>
      <h2 className="text-lg text-gray-600 mb-12 text-center">
        {t("orders.subtitle")}
      </h2>

      {Object.entries(transactionGroups).map(([transactionId, orders], idx) => (
        <div key={idx} className="mb-12 bg-blue-50 border rounded shadow-md">
          <div className="bg-blue-100 text-blue-800 px-6 py-3 font-bold text-lg border-b">
            {t("orders.orderGroup")}:{" "}
            <span className="font-mono">{transactionId}</span>
          </div>

          {orders.map((order, i) => (
            <div key={i} className="bg-white border-b">
              <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 px-6 py-3 text-lg text-gray-900 border-b">
                <span>
                  {t("orders.store")}: <strong>{order.storeName}</strong>
                </span>
                <span>
                  {t("orders.date")}:{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span>
                  {t("orders.orderId")}:{" "}
                  <strong className="font-mono">{order.orderId}</strong>
                </span>
              </div>

              <div className="divide-y px-6">
                {order.products.map((item, j) => {
                  const fullProduct = productDetails[item.productId];
                  const image =
                    fullProduct?.images?.[0] || "https://placehold.co/100";
                  const highlights =
                    fullProduct?.highlight?.[i18n.language] || [];

                  return (
                    <div
                      key={j}
                      className="flex flex-col md:flex-row items-start gap-6 py-6">
                      <img
                        src={image}
                        alt={item.name}
                        className="w-28 h-28 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-2">
                          {highlights.map((h, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 px-3 py-1 rounded-md">
                              {h}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {t("orders.quantity")}: {item.quantity}
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          ₪{item.price}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 justify-start">
                        <button
                          onClick={() => {
                            addToCart({
                              productId: item.productId,
                              quantity: 1,
                            });
                            toast.success(t("wishlist.addToCart") + " ✅");
                          }}
                          className="bg-primaryColor text-white font-bold px-4 py-2 rounded hover:bg-secondaryColor">
                          {t("orders.buyAgain")}
                        </button>
                        <button className="border border-gray-300 text-md px-4 py-2 rounded text-gray-700 hover:bg-gray-100">
                          {t("orders.shopSimilar")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-right text-green-700 font-bold text-lg pr-6 pt-2">
                {t("checkout.subtotal")}: ₪{order.totalAmount?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ))}

      {!Object.keys(transactionGroups).length && (
        <p className="text-gray-600 text-center text-lg">
          {t("orders.noOrders")}
        </p>
      )}
    </div>
  );
};

export default OrderHistory;
