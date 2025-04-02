import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import {
  FaExclamationCircle,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";

const OrderManagement = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortStatus, setSortStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/Transactions?store=${storeId}`)
      .then((res) => {
        const storeData = res.data.find((store) => store.storeId === storeId);
        if (!storeData) return;
        const filteredOrders = storeData.transactions.filter(
          (order) => order.status !== "completed" && order.status !== "canceled"
        );
        setOrders(filteredOrders);
      })
      .catch(() => showAlert("אירעה שגיאה בעת קבלת העסקאות", "error"));
  }, [storeId]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortStatusChange = (e) => {
    setSortStatus(e.target.value);
  };

  const updateDeliveryStatus = (transactionId, newStatus) => {
    axios
      .put(
        `http://localhost:5000/Transactions/${transactionId}/updateDeliveryStatus`,
        {
          deliveryStatus: newStatus, // השם הנכון!
        }
      )
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.transactionId === transactionId
              ? {
                  ...order,
                  delivery: {
                    ...order.delivery,
                    deliveryStatus: newStatus,
                  },
                }
              : order
          )
        );
        showAlert("סטטוס המשלוח עודכן בהצלחה!", "success");
      })
      .catch(() => showAlert("שגיאה בעדכון סטטוס המשלוח", "error"));
  };
  

  const updateTransactionStatus = (transactionId, newStatus) => {
    axios
      .put(`http://localhost:5000/Transactions/${transactionId}/updateTransactionStatus`, {
        status: newStatus
      })
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.transactionId === transactionId
              ? { ...order, status: newStatus }
              : order
          )
        );
        showAlert("סטטוס עסקה עודכן בהצלחה!", "success");
      })
      .catch(() => showAlert("שגיאה בעדכון סטטוס העסקה", "error"));
  };
  

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaExclamationCircle className="text-yellow-600 text-lg" />;
      case "packed":
        return <FaBoxOpen className="text-blue-600 text-lg" />;
      case "shipped":
        return <FaShippingFast className="text-green-600 text-lg" />;
      case "completed":
        return <FaCheckCircle className="text-green-600 text-lg" />;
      case "canceled":
        return <FaExclamationCircle className="text-red-600 text-lg" />;
      default:
        return <FaCheckCircle className="text-gray-500 text-lg" />;
    }
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">ניהול הזמנות</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <button
          className="bg-primaryColor text-white px-4 py-2 rounded shadow"
          onClick={toggleSortOrder}
        >
          מיין לפי תאריך {sortOrder === "asc" ? "⬆" : "⬇"}
        </button>

        <select
          className="border px-3 py-2 rounded shadow-sm text-sm"
          onChange={handleSortStatusChange}
          value={sortStatus}
        >
          <option value="">סנן לפי סטטוס</option>
          <option value="pending">ממתין</option>
          <option value="packed">נארז</option>
          <option value="shipped">נשלח</option>
          <option value="completed">נמסר</option>
          <option value="canceled">בוטל</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="max-h-[480px] overflow-y-auto">
  <table className="w-full table-fixed text-sm text-right">
    <thead className="bg-gray-100 font-bold sticky top-0 z-10">
      <tr>
        <th className="p-2 border w-[12%]">תאריך</th>
        <th className="p-2 border w-[12%]">מזהה</th>
        <th className="p-2 border w-[18%]">פרטי קונה</th>
        <th className="p-2 border w-[18%]">סטטוס עסקה</th>
        <th className="p-2 border w-[20%]">משלוח</th>
        <th className="p-2 border w-[20%]">מוצרים</th>
      </tr>
    </thead>
    <tbody className="text-sm">
      {orders
        .sort((a, b) => {
          if (sortStatus) {
            const aHasStatus = a.status === sortStatus;
            const bHasStatus = b.status === sortStatus;
            if (aHasStatus && !bHasStatus) return -1;
            if (!aHasStatus && bHasStatus) return 1;
          }
          return sortOrder === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        })
        .map((order) => (
          <tr key={order._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border text-center">
              {new Date(order.createdAt).toLocaleDateString("he-IL")}
            </td>
            <td className="p-2 border text-center">
              {order.orderId?.slice(-6)}
              <div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 underline text-xs mt-1"
                >
                  פרטים
                </button>
              </div>
            </td>
            <td className="p-2 border">
              <p className="font-semibold">{order.buyerDetails.fullName}</p>
              <p className="text-sm text-gray-600">📞 {order.buyerDetails.phone}</p>
              <p className="text-sm text-gray-600">✉ {order.buyerDetails.email}</p>
            </td>
            <td className="p-2 border text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-bold">{order.status}</span>
                </span>
                <select
  value={order.status}
  onChange={(e) => updateTransactionStatus(order.transactionId, e.target.value)}
  className="border px-2 py-1 rounded-md text-sm shadow-sm"
>

                  <option value="pending">ממתין</option>
                  <option value="packed">נארז</option>
                  <option value="shipped">נשלח</option>
                  <option value="completed">נמסר</option>
                  <option value="canceled">בוטל</option>
                </select>
              </div>
            </td>
            <td className="p-2 border text-sm text-gray-700">
              <p><strong>סטטוס:</strong> {order.delivery.deliveryStatus}</p>
              <p><strong>ת.משוער:</strong> {order.delivery.estimatedDelivery ? new Date(order.delivery.estimatedDelivery).toLocaleDateString("he-IL") : "לא זמין"}</p>
              <p><strong>מעקב:</strong> {order.delivery.trackingNumber || "לא זמין"}</p>
              <select
                onChange={(e) => updateDeliveryStatus(order.transactionId, e.target.value)}
                value={order.delivery.deliveryStatus}
                className="border px-2 py-1 rounded-md text-sm shadow-sm mt-1"
              >
                <option value="pending">ממתין</option>
                <option value="packed">נארז</option>
                <option value="shipped">נשלח</option>
                <option value="completed">נמסר</option>
                <option value="canceled">בוטל</option>
              </select>
            </td>
            <td className="p-2 border">
              {order.products.map((product) => (
                <div key={product.productId} className="border-b py-1">
                  <p className="font-semibold text-sm">
                    {product.name} - {product.quantity} יח'
                  </p>
                </div>
              ))}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
</div>



      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrderManagement;
