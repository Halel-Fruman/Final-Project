// File: SysAdmin.jsx
import  { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useAlert } from "../../components/AlertDialog.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

const SysAdmin = () => {
  const { t, i18n } = useTranslation();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStoreMode, setNewStoreMode] = useState(false);
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  const handleFieldChange = (field, value) => {
    setSelectedStore({ ...selectedStore, [field]: value });
  };

  const handleNameLangChange = (lang, value) => {
    setSelectedStore({
      ...selectedStore,
      name: { ...selectedStore.name, [lang]: value },
    });
  };

  const handleAboutLangChange = (lang, value) => {
    setSelectedStore({
      ...selectedStore,
      about: { ...selectedStore.about, [lang]: value },
    });
  };

  const handleManagerChange = (index, field, value) => {
    const updatedManagers = [...selectedStore.manager];
    updatedManagers[index][field] = value;
    setSelectedStore({ ...selectedStore, manager: updatedManagers });
  };

  const handleAddManager = () => {
    setSelectedStore({
      ...selectedStore,
      manager: [...selectedStore.manager, { name: "", emailAddress: "" }],
    });
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = (name) => name.trim().length > 0;
  const isAddressValid = (address) => address.trim().length > 0;
  const isStoreNameValid = (name) =>
    isNameValid(name.he) && isNameValid(name.en);

  const isStoreNameUnique = (name, stores, currentStoreId = null) => {
    return !stores.some(
      (store) =>
        store._id !== currentStoreId &&
        (store.name?.he === name.he || store.name?.en === name.en)
    );
  };

  useEffect(() => {
    fetchWithTokenRefresh("/api/Stores/")
      .then((res) => res.json())
      .then(setStores)
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בשרת, אנא נסה שנית.", "error");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleOpenModal = (store = null) => {
    setSelectedStore(
      store
        ? { ...store, about: store.about || { he: "", en: "" } }
        : {
            name: { he: "", en: "" },
            about: { he: "", en: "" },
            address: "",
            email: "",
            manager: [{ name: "", emailAddress: "" }],
            deliveryOptions: {
              homeDelivery: { company: "", price: 0 },
              pickupPoint: { company: "", price: 0 },
            },
          }
    );
    setNewStoreMode(!store);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!isStoreNameValid(selectedStore.name)) {
      showAlert("יש למלא שם חנות בעברית ובאנגלית.", "error");
      return;
    }
    if (!isStoreNameUnique(selectedStore.name, stores, selectedStore._id)) {
      showAlert("שם החנות כבר קיים במערכת. בחר שם אחר.", "error");
      return;
    }
    if (!isAddressValid(selectedStore.address)) {
      showAlert("כתובת החנות לא יכולה להיות ריקה.", "error");
      return;
    }
    if (!isEmailValid(selectedStore.email)) {
      showAlert("כתובת המייל של החנות אינה תקינה.", "error");
      return;
    }
    if (selectedStore.manager.length === 0) {
      showAlert("על כל חנות להיות עם לפחות מנהל אחד.", "error");
      return;
    }
    const invalidManagers = selectedStore.manager.filter(
      (m, idx, arr) =>
        !isEmailValid(m.emailAddress) ||
        !isNameValid(m.name) ||
        arr.findIndex((x) => x.emailAddress === m.emailAddress) !== idx
    );
    if (invalidManagers.length > 0) {
      showAlert("יש מנהלים עם קלט לא תקין.", "error");
      return;
    }

    const url = newStoreMode
      ? "/api/Stores/"
      : `/api/Stores/${selectedStore._id}`;
    const method = newStoreMode ? "POST" : "PUT";

    try {
      const res = await fetchWithTokenRefresh(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedStore),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();

      setStores((prev) =>
        newStoreMode
          ? [...prev, data]
          : prev.map((s) => (s._id === selectedStore._id ? data : s))
      );
      showAlert(
        newStoreMode ? "החנות נוספה בהצלחה!" : "החנות עודכנה בהצלחה!",
        "success"
      );
      handleCloseModal();
    } catch {
      showAlert("אירעה שגיאה בעת שמירת החנות.", "error");
    }
  };

  const handleDeleteStore = () => {
    showAlert("האם אתה בטוח שברצונך למחוק את החנות?", "warning", async () => {
      try {
        const res = await fetchWithTokenRefresh(
          `/api/Stores/${selectedStore._id}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) throw new Error();
        setStores(stores.filter((s) => s._id !== selectedStore._id));
        handleCloseModal();
        showAlert("החנות נמחקה בהצלחה!", "success");
      } catch {
        showAlert("אירעה שגיאה בעת מחיקת החנות.", "error");
      }
    });
  };

  const handleRemoveManager = (index) => {
    if (selectedStore.manager.length === 1) {
      showAlert("לא ניתן למחוק את המנהל האחרון.", "error");
      return;
    }
    showAlert("האם אתה בטוח שברצונך למחוק את המנהל?", "warning", () => {
      const updated = selectedStore.manager.filter((_, i) => i !== index);
      setSelectedStore({ ...selectedStore, manager: updated });
    });
  };
  const handleExportStores = () => {
    const data = stores.map((store) => ({
      שם_חנות: store.name?.he || "",
      Address: store.address,
      Email: store.email,
      מנהלים: store.manager
        .map((m) => `${m.name} <${m.emailAddress}>`)
        .join("; "),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "stores.xlsx"
    );
  };

  return (
    <div className="container lg:w-full w-fit mx-auto p-5">
      <header className="text-center mb-8">
        <h1 className="text-3xl text-primaryColor font-bold">
          {t("sysadmin.store_managemnt")}
        </h1>
      </header>

      <div className="flex justify-end mb-4">
        <button
          className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
          onClick={() => handleOpenModal()}
          aria-label="Add Store">
          <Icon
            icon="material-symbols:add-business-outline"
            width="48"
            height="48"
          />
        </button>
        <button
          className="text-green-600 hover:text-green-800"
          onClick={handleExportStores}
          title="ייצוא לאקסל">
          <Icon icon="mdi:export" width="30" height="30" />
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded h-10 w-full"></div>
          ))}
        </div>
      ) : (
        <table className="table-auto p-6 w-full border border-gray-300">
          <thead>
            <tr className="bg-primaryColor text-white text-xl font-bold">
              <th className="border px-4 py-2">{t("sysadmin.store_name")}</th>
              <th className="border px-4 py-2">
                {t("sysadmin.store_address")}
              </th>
              <th className="border px-4 py-2">{t("sysadmin.store_email")}</th>
              <th className="border px-4 py-2">{t("sysadmin.managers")}</th>
              <th className="border px-2 py-2">{t("sysadmin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id}>
                <td className="border px-4 py-2">
                  {store.name?.[i18n.language] || store.name?.he}
                </td>
                <td className="border px-4 py-2">{store.address}</td>
                <td className="border px-4 py-2">{store.email}</td>
                <td className="border px-4 py-2">
                  {store.manager.map((mgr, idx) => (
                    <div key={idx}>{mgr.name}</div>
                  ))}
                </td>
                <td className="border text-center px-4 py-2">
                  <button
                    className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                    onClick={() => handleOpenModal(store)}
                    aria-label="Edit Store">
                    <Icon
                      icon="tabler:shopping-bag-edit"
                      width="24"
                      height="24"
                    />
                  </button>
                  <button
                    className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                    onClick={() =>
                      window.open(
                        `/shop/store-management/${store._id}`,
                        "_blank"
                      )
                    }
                    title={t("sysadmin.go_to_store_management")}>
                    <Icon
                      icon="material-symbols:settings-outline"
                      width="24"
                      height="24"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">
              {newStoreMode
                ? t("sysadmin.add_store")
                : t("sysadmin.edit_store")}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">שם החנות בעברית</label>
              <input
                type="text"
                aria-label="Store Name in Hebrew"
                className="w-full border px-3 py-2"
                value={selectedStore.name.he}
                onChange={(e) => handleNameLangChange("he", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">שם החנות באנגלית</label>
              <input
                type="text"
                aria-label="Store Name in English"
                className="w-full border px-3 py-2"
                value={selectedStore.name.en}
                onChange={(e) => handleNameLangChange("en", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">
                {t("sysadmin.store_address")}
              </label>
              <input
                type="text"
                aria-label="Store Address"
                className="w-full border px-3 py-2"
                value={selectedStore.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">{t("sysadmin.store_email")}</label>
              <input
                type="email"
                aria-label="Store Email"
                className="w-full border px-3 py-2"
                value={selectedStore.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
              <div>
                <label className="block mb-1">
                  {t("sysadmin.delivery_company_home")}
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2"
                  value={
                    selectedStore?.deliveryOptions?.homeDelivery?.company || ""
                  }
                  onChange={(e) =>
                    setSelectedStore((prev) => ({
                      ...prev,
                      deliveryOptions: {
                        ...prev.deliveryOptions,
                        homeDelivery: {
                          ...prev.deliveryOptions?.homeDelivery,
                          company: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label className="block mb-1">
                  {t("sysadmin.delivery_price_home")}
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2"
                  value={
                    selectedStore?.deliveryOptions?.homeDelivery?.price || 0
                  }
                  onChange={(e) =>
                    setSelectedStore((prev) => ({
                      ...prev,
                      deliveryOptions: {
                        ...prev.deliveryOptions,
                        homeDelivery: {
                          ...prev.deliveryOptions?.homeDelivery,
                          price: Number(e.target.value),
                        },
                      },
                    }))
                  }
                />
              </div>




            </div>
            <div className="mb-4">
              <label className="block mb-1">
                {t("sysadmin.store_about_he")}
              </label>
              <textarea
                className="w-full border px-3 py-2"
                rows={3}
                value={selectedStore.about?.he || ""}
                onChange={(e) => handleAboutLangChange("he", e.target.value)}
                placeholder={t("sysadmin.store_about_placeholder_he")}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">
                {t("sysadmin.store_about_en")}
              </label>
              <textarea
                className="w-full border px-3 py-2"
                rows={3}
                value={selectedStore.about?.en || ""}
                onChange={(e) => handleAboutLangChange("en", e.target.value)}
                placeholder={t("sysadmin.store_about_placeholder_en")}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">{t("sysadmin.managers")}</label>
              {selectedStore.manager.map((mgr, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    aria-label="Manager Name"
                    placeholder={t("sysadmin.manager_name")}
                    className="border px-3 py-2 mr-2 flex-1"
                    value={mgr.name}
                    onChange={(e) =>
                      handleManagerChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="email"
                    aria-label="Manager Email"
                    placeholder={t("sysadmin.manager_email")}
                    className="border px-3 py-2 mr-2 flex-1"
                    value={mgr.emailAddress}
                    onChange={(e) =>
                      handleManagerChange(index, "emailAddress", e.target.value)
                    }
                  />
                  <button
                    className="bg-white text-deleteC px-2 py-2 rounded hover:bg-deleteC hover:text-white ring-2 ring-gray-200 hover:ring-deleteC transition duration-200"
                    onClick={() => handleRemoveManager(index)}
                    aria-label="Remove Manager">
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="24"
                      height="24"
                    />
                  </button>
                </div>
              ))}
              <button
                className="text-black px-2 py-2 mt-2 flex items-center hover:bg-primaryColor hover:text-white"
                onClick={handleAddManager}
                aria-label="Add Manager">
                <Icon
                  icon="material-symbols:add-circle-outline-rounded"
                  width="24"
                  height="24"
                />
              </button>
            </div>

            <div className="flex justify-between items-center mt-6">
              {!newStoreMode && (
                <button
                  className="bg-white text-deleteC px-2 py-2 rounded-full hover:bg-deleteC hover:text-white ring-2 ring-gray-200 hover:ring-deleteC transition duration-200"
                  onClick={handleDeleteStore}
                  aria-label="Delete Store">
                  <Icon
                    icon="material-symbols:delete-outline"
                    width="28"
                    height="28"
                  />
                </button>
              )}

              <div className="flex justify-end">
                <button
                  className="bg-white text-gray-600 px-2 py-2 border-primaryColor rounded mr-2 hover:bg-gray-600 hover:text-white"
                  onClick={handleCloseModal}
                  aria-label="Close Modal">
                  <Icon
                    icon="material-symbols:cancel-outline-rounded"
                    width="36"
                    height="36"
                  />
                </button>
                <button
                  className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded mr-2 hover:bg-primaryColor hover:text-white"
                  onClick={handleSave}
                  aria-label="Save Store">
                  <Icon
                    icon="material-symbols:check-circle-outline-rounded"
                    width="36"
                    height="36"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SysAdmin;
