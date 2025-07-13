/**
 * @file StoreSettings.jsx
 * @description This file contains the StoreSettings component which allows store managers to manage their store settings
 */
import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

/**
 * @function StoreSettings
 * @description This function component renders the settings page for a specific store.
 * It allows the store manager to update various settings related to the store.
 * @param {string} props.storeId - The ID of the store to fetch settings for
 * @param {string} props.token - The authentication token for API requests
 */
const StoreSettings = ({ storeId, token }) => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    axios
      .get(`/api/Stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStore(res.data))
      .catch(() => showAlert(t("store_settings.load_error"), "error"))
      .finally(() => setLoading(false));
  }, [storeId, token, t]);

  const handleChange = (section, field, value) => {
    setStore((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (section, sub, field, value) => {
    setStore((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [sub]: {
          ...prev[section]?.[sub],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    axios
      .put(`/api/Stores/${storeId}`, store, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => showAlert(t("store_settings.save_success"), "success"))
      .catch(() => showAlert(t("store_settings.save_error"), "error"));
  };

  if (loading || !store) return <p>{t("store_settings.loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg border">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t("store_settings.title")}
      </h1>

      {/* About Fields */}
      <div className="mb-4">
        <label className="block font-semibold">
          {t("store_settings.about_he")}
        </label>
        <textarea
          className="w-full border p-2 rounded  h-32"
          value={store.about?.he || ""}
          onChange={(e) => handleChange("about", "he", e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">
          {t("store_settings.about_en")}
        </label>
        <textarea
          className="w-full border p-2 rounded  h-32"
          value={store.about?.en || ""}
          onChange={(e) => handleChange("about", "en", e.target.value)}
        />
      </div>

      {/* Delivery Options */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          {t("store_settings.courier")}
        </h2>
        <input
          className="w-full border p-2 mb-2 rounded w-8/12"
          placeholder={t("store_settings.company_name")}
          value={store.deliveryOptions?.homeDelivery?.company || ""}
          onChange={(e) =>
            handleNestedChange(
              "deliveryOptions",
              "homeDelivery",
              "company",
              e.target.value
            )
          }
        />
        <input
          type="number"
          className="w-full border p-2 rounded w-8/12"
          placeholder={t("store_settings.price")}
          value={store.deliveryOptions?.homeDelivery?.price || 0}
          onChange={(e) =>
            handleNestedChange(
              "deliveryOptions",
              "homeDelivery",
              "price",
              Number(e.target.value)
            )
          }
        />
      </div>

      {/* Store Name */}

      <button
        className="bg-primaryColor text-white px-6 py-2 rounded-full hover:bg-secondaryColor"
        onClick={handleSave}>
        {t("store_settings.save_button")}
      </button>
    </div>
  );
};

export default StoreSettings;
