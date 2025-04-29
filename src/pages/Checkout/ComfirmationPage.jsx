// File: ConfirmationPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  const transactionId = searchParams.get("index"); // מוציאים את מזהה העסקה מה-URL

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/status/${transactionId}`);
        if (!res.ok) {
          throw new Error("Order not found");
        }
        const data = await res.json();
        setOrderData(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
        setOrderData(null);
      }
    };

    if (transactionId) {
      fetchOrder();
    }
  }, [transactionId]);

  if (!orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold text-gray-700">{t("confirmation.loading")}</h2>
        <button
          className="mt-6 px-4 py-2 bg-primaryColor text-white rounded"
          onClick={() => navigate("/")}>
          {t("confirmation.backHome")}
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-6 text-primaryColor">
        {t("confirmation.title")}
      </h1>
      <h2 className="text-gray-700 mb-4">{t("confirmation.successMessage")}</h2>

      <div className="mt-8 text-lg text-gray-800 space-y-4">
        <div>
          <span className="font-bold">{t("confirmation.orderId")}:</span>{" "}
          <span className="font-mono">{orderData.transactionId}</span>
        </div>
        <div>
          <span className="font-bold">{t("confirmation.totalSum")}:</span>{" "}
          ₪{Number(orderData.totalAmount).toFixed(2)}
        </div>
        <div>
          <span className="font-bold">{t("confirmation.createdAt")}:</span>{" "}
          {new Date(orderData.createdAt).toLocaleString("he-IL")}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() =>
            navigate("/personal-area", { state: { selectedTab: "orders" } })
          }
          className="px-6 py-2 bg-primaryColor text-white text-xl font-bold rounded-md hover:bg-secondaryColor"
        >
          {t("confirmation.viewOrders")}
        </button>
      </div>
    </main>
  );
};

export default ConfirmationPage;
