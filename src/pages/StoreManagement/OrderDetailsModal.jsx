import React from "react";
import { FaTimes } from "react-icons/fa";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const {
    transactionId,
    orderId,
    status,
    totalAmount,
    createdAt,
    buyerDetails,
    products,
    delivery,
  } = order;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">פרטי הזמנה</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <p><strong>מזהה עסקה:</strong> {transactionId}</p>
          <p><strong>מזהה הזמנה:</strong> {orderId}</p>
          <p><strong>סטטוס:</strong> {status}</p>
          <p><strong>תאריך:</strong> {new Date(createdAt).toLocaleDateString("he-IL")}</p>
          <p><strong>סכום כולל:</strong> {totalAmount}₪</p>
        </div>

        <hr className="my-3" />

        <div className="mb-4 text-sm">
          <h3 className="font-bold mb-2">👤 פרטי קונה</h3>
          <p><strong>שם:</strong> {buyerDetails.fullName}</p>
          <p><strong>טלפון:</strong> {buyerDetails.phone}</p>
          <p><strong>אימייל:</strong> {buyerDetails.email}</p>
          <p><strong>כתובת:</strong> {buyerDetails.address}</p>
        </div>

        <hr className="my-3" />

        <div className="mb-4 text-sm">
          <h3 className="font-bold mb-2">🚚 פרטי משלוח</h3>
          <p><strong>שיטה:</strong> {delivery.deliveryMethod}</p>
          <p><strong>סטטוס:</strong> {delivery.deliveryStatus}</p>
          <p><strong>מספר מעקב:</strong> {delivery.trackingNumber || "לא זמין"}</p>
          <p><strong>תאריך משוער:</strong> {delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toLocaleDateString("he-IL") : "לא זמין"}</p>
        </div>

        <hr className="my-3" />

        <div className="text-sm">
          <h3 className="font-bold mb-2">📦 מוצרים</h3>
          <ul className="list-disc pr-5">
            {products.map((product, index) => (
              <li key={index} className="mb-1">
                {product.name} (×{product.quantity}) — {product.price}₪
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
