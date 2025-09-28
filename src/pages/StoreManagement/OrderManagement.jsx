/**
 * @file OrderManagement.jsx
 * @description This file contains the OrderManagement component which allows store managers to manage orders.
 */
import { useState, useEffect } from "react";
import { useAlert } from "../../components/AlertDialog.jsx";
import {
  FaExclamationCircle,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Icon } from "@iconify/react";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

/**
 * @function OrderManagement
 * @description This component allows store managers to manage orders.
 * It includes functionalities to view, sort, filter, and update order statuses.
 * @param {Object} props - The component props.
 * @param {string} props.storeId - The ID of the store for which orders are being managed.
 * @param {Array} [props.statusFilter=[]] - An array of order statuses to filter by.
 * @param {string} [props.title] - The title of the component.
 */
const OrderManagement = ({ storeId, statusFilter = [], title }) => {
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortStatus, setSortStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showAlert } = useAlert();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pagetitle, setpagetitle] = useState(title);

  // fetch orders when the component mounts or when storeId changes
  // This function fetches the orders for the specified store and updates the state
  useEffect(() => {
    fetchWithTokenRefresh(`/api/Transactions?store=${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        const storeData = data.find((store) => store.storeId === storeId);
        if (!storeData) return;

        const filteredOrders = storeData.transactions.filter((order) => {
          if (statusFilter.length > 0) {
            return statusFilter.includes(order.status);
          }
          return order.status !== "completed" && order.status !== "canceled";
        });
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

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.transactionId === updatedOrder.transactionId
          ? updatedOrder
          : order
      )
    );
    setSelectedOrder(null);
  };

  const updateDeliveryStatus = async (transactionId, newStatus) => {
    try {
      await fetchWithTokenRefresh(
        `/api/Transactions/${transactionId}/updateDeliveryStatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryStatus: newStatus }),
        }
      );

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
    } catch {
      showAlert("שגיאה בעדכון סטטוס המשלוח", "error");
    }
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      await fetchWithTokenRefresh(
        `/api/Transactions/${transactionId}/updateTransactionStatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === transactionId
            ? { ...order, status: newStatus }
            : order
        )
      );
      showAlert("סטטוס עסקה עודכן בהצלחה!", "success");
    } catch {
      showAlert("שגיאה בעדכון סטטוס העסקה", "error");
    }
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

  const isOverdue = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffInDays >= 3;
  };

  // Function to handle exporting orders to Excel
  // This function formats the orders data and generates an Excel file for download
  const handleExportOrders = () => {
    const data = orders.map((order) => {
      const productsList = order.products
        .map((p) => `${p.name} (x${p.quantity})`)
        .join(" | ");
      return {
        "מזהה הזמנה": order.orderId,
        "סטטוס עסקה": order.status,
        "סטטוס משלוח": order.delivery?.deliveryStatus || "",
        "שם לקוח": order.buyerDetails?.fullName || "",
        טלפון: order.buyerDetails?.phone || "",
        אימייל: order.buyerDetails?.email || "",
        כתובת: order.buyerDetails?.address || "",
        "תאריך יצירה": new Date(order.createdAt).toLocaleDateString("he-IL"),
        "תאריך משוער": order.delivery?.estimatedDelivery
          ? new Date(order.delivery.estimatedDelivery).toLocaleDateString(
              "he-IL"
            )
          : "",
        "מספר מעקב": order.delivery?.trackingNumber || "",
        מוצרים: productsList,
        "סכום כולל": `${order.totalAmount || 0} ₪`,
      };
    });

    const headers = Object.keys(data[0]);
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = headers.map((key) => ({ wch: key.length + 2 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "orders.xlsx"
    );
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">{pagetitle}</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <button
          className="bg-primaryColor text-xl font-bold text-white px-4 py-2 rounded shadow"
          onClick={toggleSortOrder}>
          <h2>מיין לפי תאריך {sortOrder === "asc" ? "⬆" : "⬇"}</h2>
        </button>

        <select
          aria-label="סנן לפי סטטוס"
          className="border px-3 py-2 rounded shadow-sm text-sm"
          onChange={handleSortStatusChange}
          value={sortStatus}>
          <option value="">סנן לפי סטטוס</option>
          <option value="pending">ממתין</option>
          <option value="packed">נארז</option>
          <option value="shipped">נשלח</option>
          <option value="completed">נמסר</option>
          <option value="canceled">בוטל</option>
        </select>
        <button
          onClick={handleExportOrders}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          title="ייצוא לאקסל">
          <Icon icon="mdi:export" width="30" />
        </button>
      </div>

      <div className="max-h-[480px] rounded-lg shadow w-full overflow-x-auto bg-transparent">
        <div className="w-full overflow-x-auto max-h-[480px]">
          <table className="min-w-full text-sm  border border-gray-300 rounded-lg">
            <thead className="bg-gray-100 font-bold sticky top-0 z-10 hidden md:table-header-group">
              <tr>
                <th className="p-2 border w-1/10">תאריך</th>
                <th className="p-2 border w-1/10">מזהה</th>
                <th className="p-2 border w-1/5">פרטי קונה</th>
                <th className="p-2 border w-1/5">סטטוס עסקה</th>
                <th className="p-2 border w-1/5">משלוח</th>
                <th className="p-2 border w-1/5">מוצרים</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
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
                .map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <tr
                      key={order._id}
                      className={`even:bg-gray-50 hover:bg-gray-100 block md:table-row border border-b md:border-none mb-4 md:mb-0 rounded md:rounded-none
                ${
                  order.status === "pending" && isOverdue(order.createdAt)
                    ? "bg-red-100 border-red-400"
                    : ""
                }`}>
                      <td className="p-2 border text-center md:w-1/10">
                        <span className="md:hidden font-bold">תאריך: </span>
                        {new Date(order.createdAt).toLocaleDateString("he-IL")}
                        {order.status === "pending" &&
                          isOverdue(order.createdAt) && (
                            <div className="text-red-900 text-xs mt-1">
                              הזמנה ממתינה זמן רב!
                            </div>
                          )}
                      </td>
                      <td className="p-2 border text-center md:w-1/10">
                        <span className="md:hidden font-bold">מזהה: </span>
                        {order.orderId?.slice(-6)}
                        <div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-900 underline text-xs mt-1">
                            פרטים
                          </button>
                          <button
                            className="md:hidden text-blue-600 underline text-xs mt-1"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order._id)
                            }>
                            {isExpanded ? "הסתר פרטים" : "הצג פרטים"}
                          </button>
                        </div>
                      </td>
                      {isExpanded || window.innerWidth >= 768 ? (
                        <>
                          <td className="p-2 border md:w-1/5">
                            <span className="md:hidden font-bold">קונה: </span>
                            <p className="font-semibold">
                              {order.buyerDetails.fullName}
                            </p>
                            <p className="text-sm text-gray-800">
                              📞 {order.buyerDetails.phone}
                            </p>
                            <p className="text-sm text-gray-800">
                              ✉ {order.buyerDetails.email}
                            </p>
                          </td>
                          <td className="p-2 border text-center md:w-1/5">
                            <span className="md:hidden font-bold">
                              סטטוס עסקה:{" "}
                            </span>
                            <div className="flex flex-col items-center gap-1">
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                <span className="text-sm font-bold">
                                  {order.status}
                                </span>
                              </span>
                              <select
                                aria-label="עדכון סטטוס עסקה"
                                value={order.status}
                                onChange={(e) =>
                                  updateTransactionStatus(
                                    order.transactionId,
                                    e.target.value
                                  )
                                }
                                className="border px-2 py-1 rounded-md text-sm shadow-sm">
                                <option value="pending">ממתין</option>
                                <option value="packed">נארז</option>
                                <option value="shipped">נשלח</option>
                                <option value="completed">נמסר</option>
                                <option value="canceled">בוטל</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-2 border text-sm text-gray-700 md:w-1/5">
                            <span className="md:hidden font-bold">משלוח: </span>
                            <p>
                              <strong>ת.משוער:</strong>{" "}
                              {order.delivery.estimatedDelivery
                                ? new Date(
                                    order.delivery.estimatedDelivery
                                  ).toLocaleDateString("he-IL")
                                : "לא זמין"}
                            </p>
                            <p>
                              <strong>מס.מעקב:</strong>{" "}
                              {order.delivery.trackingNumber || "לא זמין"}
                            </p>
                          </td>
                          <td className="p-2 border md:w-1/5">
                            <span className="md:hidden font-bold">
                              מוצרים:{" "}
                            </span>
                            {order.products.map((product) => (
                              <div
                                key={product.productId}
                                className="border-b py-1">
                                <p className="font-semibold text-sm">
                                  {product.name} - {product.quantity} יח'
                                </p>
                              </div>
                            ))}
                          </td>
                        </>
                      ) : null}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          showAlert={showAlert}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default OrderManagement;
