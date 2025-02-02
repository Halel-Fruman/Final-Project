import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import {
  FaExclamationCircle,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";

const OrderManagement = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); //The sortOrder state is used to store the sort order value
  const [sortStatus, setSortStatus] = useState(""); //The sortStatus state is used to store the sort status value
  const { showAlert } = useAlert(); // The useAlert hook is used to show an alert message

  // The useEffect hook is used to fetch the transactions data from the server
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
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת קבלת העסקאות", "error");
      });
  }, [storeId]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortStatusChange = (e) => {
    setSortStatus(e.target.value);
  };

  const updateDeliveryStatus = (orderId, newStatus) => {
    axios
      .put(
        `http://localhost:5000/Transactions/${orderId}/updateDeliveryStatus`,
        { status: newStatus }
      )
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  delivery: { ...order.delivery, deliveryStatus: newStatus },
                }
              : order
          )
        );
        showAlert("סטטוס המשלוח עודכן בהצלחה!", "success");
      })
      .catch(() => showAlert("שגיאה בעדכון סטטוס המשלוח", "error"));
  };
  // The updateTransactionStatus function is used to update the transaction status
  const updateTransactionStatus = (orderId, newStatus) => {
    axios
      .put(
        `http://localhost:5000/Transactions/${orderId}/updateTransactionStatus`,
        { status: newStatus }
      )
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        showAlert("סטטוס עסקה עודכן בהצלחה!", "success");
      })
      .catch(() => showAlert("שגיאה בעדכון סטטוס העסקה", "error"));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaExclamationCircle className="text-red-500" />;
      case "packed":
        return <FaBoxOpen className="text-yellow-500" />;
      case "shipped":
        return <FaShippingFast className="text-green-500" />;
      default:
        return <FaCheckCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center mb-8 text-2xl font-bold">ניהול הזמנות</h1>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-primaryColor text-white px-4 py-2 rounded-lg shadow-md"
          onClick={toggleSortOrder}>
          מיין לפי תאריך {sortOrder === "asc" ? "⬆" : "⬇"}
        </button>

        <select
          className="border px-3 py-2 rounded-lg shadow-md"
          onChange={handleSortStatusChange}
          value={sortStatus}>
          <option value="">סנן לפי סטטוס</option>
          <option value="pending">ממתין</option>
          <option value="packed">נארז</option>
          <option value="shipped">נשלח</option>
          <option value="completed">נמסר</option>
          <option value="canceled">בוטל</option>
        </select>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-screen">
        <table className="min-w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-center">
              <th className="border p-3">תאריך</th>
              <th className="border p-3">מזהה</th>
              <th className="border p-3">פרטי קונה</th>
              <th className="border p-3">סטטוס עסקה</th>
              <th className="border p-3">פרטי משלוח</th>
              <th className="border p-3">מוצרים</th>
            </tr>
          </thead>
          <tbody>
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
              .map((order, index) => (
                <tr
                  key={order._id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}>
                  <td className="border p-3 text-center">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border p-3 text-center">
                    {order.transactionId.slice(-6)}
                  </td>
                  <td className="border p-3">
                    <p className="font-semibold">
                      {order.buyerDetails.fullName}
                    </p>
                    <p>📞 {order.buyerDetails.phone}</p>
                    <p>✉ {order.buyerDetails.email}</p>
                  </td>
                  <td className="border p-3 font-bold text-center">
                    <select
                      onChange={(e) =>
                        updateTransactionStatus(order._id, e.target.value)
                      }
                      value={order.status}
                      className="border px-2 py-1 rounded-md text-sm">
                      <option value="pending">ממתין</option>
                      <option value="packed">נארז</option>
                      <option value="shipped">נשלח</option>
                      <option value="completed">נמסר</option>
                      <option value="canceled">בוטל</option>
                    </select>
                    <span className="mr-3">{getStatusIcon(order.status)}</span>
                  </td>
                  <td className="border p-3">
                    <p>
                      <strong>סטטוס:</strong> {order.delivery.deliveryStatus}
                    </p>
                    <p>
                      <strong>ת.משוער:</strong>{" "}
                      {order.delivery.estimatedDelivery
                        ? new Date(
                            order.delivery.estimatedDelivery
                          ).toLocaleDateString()
                        : "לא זמין"}
                    </p>
                    <p>
                      <strong>מספר מעקב:</strong>{" "}
                      {order.delivery.trackingNumber || "לא זמין"}
                    </p>
                    <select
                      onChange={(e) =>
                        updateDeliveryStatus(order._id, e.target.value)
                      }
                      value={order.delivery.deliveryStatus}
                      className="border px-2 py-1 rounded-md text-sm">
                      <option value="pending">ממתין</option>
                      <option value="packed">נארז</option>
                      <option value="shipped">נשלח</option>
                      <option value="completed">נמסר</option>
                      <option value="canceled">בוטל</option>
                    </select>
                  </td>
                  <td className="border p-3">
                    {order.products.map((product) => (
                      <div key={product.productId} className="border-b p-2">
                        <p className="font-semibold">
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
  );
};
export default OrderManagement;
