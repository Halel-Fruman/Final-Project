import React, { useState } from "react";
import { FaTimes, FaEdit, FaSave, FaUndo } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { motion } from "framer-motion";

import { toast } from "react-hot-toast";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

const statusOptions = ["pending", "packed", "shipped", "completed", "canceled"];
const statusTranslations = {
  pending: "ממתין",
  packed: "נארז",
  shipped: "נשלח",
  completed: "נמסר",
  canceled: "בוטל",
};

const deliveryFields = [
  "deliveryMethod",
  "trackingNumber",
  "estimatedDelivery",
  "deliveryDate",
];

const formatDate = (date) => {
  if (!date) return "";
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().split("T")[0];
};

const formatDisplayDate = (date) => {
  if (!date) return "לא זמין";
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime())
    ? "לא זמין"
    : parsedDate.toLocaleDateString("he-IL");
};

const cleanInput = (value, isDate) => {
  if (isDate) {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
  }
  return value.trim();
};

const OrderDetailsModal = ({ order, onClose, showAlert }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableOrder, setEditableOrder] = useState(order);

  if (!order) return null;

  const handleChange = (section, field, value) => {
    const isDate =
      field.includes("Date") || field.includes("estimatedDelivery");
    setEditableOrder((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: cleanInput(value, isDate),
      },
    }));
  };

  const handleFieldChange = (field, value) => {
    setEditableOrder((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));
  };

  const handleConfirmSave = () => {
    showAlert(
      "האם אתה בטוח שברצונך לעדכן את ההזמנה?",
      "question",
      handleSaveChanges
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await fetchWithTokenRefresh(
        `/api/Transactions/${editableOrder.transactionId}/updateTransaction`,
        {
          method: "PUT",
          body: JSON.stringify(editableOrder),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("העסקה עודכנה בהצלחה!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("אירעה שגיאה בעדכון העסקה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditableOrder(order);
    setIsEditing(false);
  };

  const {
    transactionId,
    orderId,
    status,
    totalAmount,
    createdAt,
    buyerDetails,
    products,
    delivery,
  } = editableOrder;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold">פרטי הזמנה</h2>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="text-blue-600 hover:text-blue-800 flex items-center">
                  {isSaving ? (
                    <ImSpinner2 className="animate-spin" size={24} />
                  ) : (
                    <FaSave size={24} />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="text-gray-600 hover:text-gray-800 flex items-center">
                  <FaUndo size={24} />
                </button>
              </>
            ) : (
              <button
                onClick={handleToggleEdit}
                className="text-blue-600 hover:text-blue-800">
                <FaEdit size={24} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-red-600 hover:text-red-800">
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 text-base flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <strong>מזהה עסקה:</strong> {transactionId}
            </div>
            <div>
              <strong>מזהה הזמנה:</strong> {orderId}
            </div>
            <div>
              <strong>סטטוס:</strong>
              {isEditing ? (
                <select
                  className="border rounded-lg p-2 w-full mt-1"
                  value={status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {statusTranslations[option]}
                    </option>
                  ))}
                </select>
              ) : (
                <span> {statusTranslations[status] || status}</span>
              )}
            </div>
            <div>
              <strong>תאריך יצירה:</strong> {formatDisplayDate(createdAt)}
            </div>
            <div>
              <strong>סכום כולל:</strong> {totalAmount}₪
            </div>
          </div>

          <hr />

          <div>
            <h3 className="font-bold text-lg mb-3">👤 פרטי לקוח</h3>
            <div className="space-y-2">
              <div>
                <strong>שם:</strong> {buyerDetails.fullName}
              </div>
              <div>
                <strong>אימייל:</strong> {buyerDetails.email}
              </div>
              <div>
                <strong>טלפון:</strong> {buyerDetails.phone}
              </div>
              <div>
                <strong>כתובת למשלוח:</strong> {buyerDetails.address}
              </div>
            </div>
          </div>

          <hr />

          <div>
            <h3 className="font-bold text-lg mb-3">🚚 פרטי משלוח</h3>
            <div className="space-y-4">
              {deliveryFields.map((key) => (
                <div key={key}>
                  <strong>{getDeliveryLabel(key)}:</strong>
                  {isEditing ? (
                    <input
                      className="border rounded-lg p-2 w-full mt-1"
                      type={
                        key.includes("Date") || key === "estimatedDelivery"
                          ? "date"
                          : "text"
                      }
                      placeholder={
                        key.includes("Date") ? "בחר תאריך" : "הזן פרטים"
                      }
                      value={
                        key.includes("Date") || key === "estimatedDelivery"
                          ? formatDate(delivery[key])
                          : delivery[key] || ""
                      }
                      onChange={(e) =>
                        handleChange("delivery", key, e.target.value)
                      }
                      // 👇 מבטל הגבלת תאריך עתידי בלבד
                      max=""
                      min=""
                    />
                  ) : (
                    <span>
                      {key.includes("Date") || key === "estimatedDelivery"
                        ? formatDisplayDate(delivery[key])
                        : delivery[key] || "לא זמין"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr />

          <div>
            <h3 className="font-bold text-lg mb-3">📦 מוצרים</h3>
            <ul className="list-disc pr-5 space-y-2">
              {products.map((product, index) => (
                <li key={index}>
                  {product.name} (×{product.quantity}) — {product.price}₪
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const getBuyerLabel = (key) => {
  switch (key) {
    case "fullName":
      return "שם";
    case "phone":
      return "טלפון";
    case "email":
      return "אימייל";
    case "address":
      return "כתובת";
    default:
      return key;
  }
};

const getDeliveryLabel = (key) => {
  switch (key) {
    case "deliveryMethod":
      return "שיטה";
    case "trackingNumber":
      return "מספר מעקב";
    case "estimatedDelivery":
      return "תאריך הגעה משוער";
    case "deliveryDate":
      return "תאריך מסירה";
    default:
      return key;
  }
};

export default OrderDetailsModal;
