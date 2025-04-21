import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useAlert } from "../../components/AlertDialog.jsx";

const SysAdmin = () => {
  const { t, i18n } = useTranslation();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStoreMode, setNewStoreMode] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    axios
      .get("/api/Stores/")
      .then((res) => {
        setStores(res.data);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בשרת, אנא נסה שנית.", "error");
      });
  }, []);

  const handleOpenModal = (store = null) => {
    setSelectedStore(
      store || {
        name: { he: "", en: "" },
        address: "",
        email: "",
        manager: [{ name: "", emailAddress: "" }],
      }
    );
    setNewStoreMode(!store);
    setIsModalOpen(true);
  };

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

  const handleManagerChange = (index, field, value) => {
    const updatedManagers = [...selectedStore.manager];
    updatedManagers[index][field] = value;
    setSelectedStore({ ...selectedStore, manager: updatedManagers });
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

  const handleAddManager = () => {
    setSelectedStore({
      ...selectedStore,
      manager: [...selectedStore.manager, { name: "", emailAddress: "" }],
    });
  };

  const handleSave = () => {
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
    const method = newStoreMode ? "post" : "put";

    axios[method](url, selectedStore)
      .then((res) => {
        if (newStoreMode) {
          setStores([...stores, res.data]);
          showAlert("החנות נוספה בהצלחה!", "success");
        } else {
          setStores(
            stores.map((s) => (s._id === selectedStore._id ? res.data : s))
          );
          showAlert("החנות עודכנה בהצלחה!", "success");
        }
        handleCloseModal();
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת שמירת החנות.", "error");
      });
  };

  const handleDeleteStore = () => {
    showAlert("האם אתה בטוח שברצונך למחוק את החנות?", "warning", () => {
      axios
        .delete(`/api/Stores/${selectedStore._id}`)
        .then(() => {
          setStores(stores.filter((s) => s._id !== selectedStore._id));
          handleCloseModal();
          showAlert("החנות נמחקה בהצלחה!", "success");
        })
        .catch((err) => {
          console.log(err);
          showAlert("אירעה שגיאה בעת מחיקת החנות.", "error");
        });
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

  return (
    <div className="container mx-auto p-5">
      <header className="text-center mb-8">
        <h1 className="text-3xl text-primaryColor font-bold">
          {t("sysadmin.store_managemnt")}
        </h1>
      </header>

      <div className="flex justify-end mb-4">
        <button
          className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
          onClick={() => handleOpenModal()}>
          <Icon
            icon="material-symbols:add-business-outline"
            width="48"
            height="48"
          />
        </button>
      </div>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-primaryColor text-white">
            <th className="border px-4 py-2">{t("sysadmin.store_name")}</th>
            <th className="border px-4 py-2">{t("sysadmin.store_address")}</th>
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
              <td className="border px-4 py-2">
                <button
                  className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                  onClick={() => handleOpenModal(store)}>
                  <Icon
                    icon="tabler:shopping-bag-edit"
                    width="24"
                    height="24"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-center">
              {newStoreMode
                ? t("sysadmin.add_store")
                : t("sysadmin.edit_store")}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">שם החנות בעברית</label>
              <input
                type="text"
                className="w-full border px-3 py-2"
                value={selectedStore.name.he}
                onChange={(e) => handleNameLangChange("he", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">שם החנות באנגלית</label>
              <input
                type="text"
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
                className="w-full border px-3 py-2"
                value={selectedStore.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">{t("sysadmin.store_email")}</label>
              <input
                type="email"
                className="w-full border px-3 py-2"
                value={selectedStore.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">{t("sysadmin.managers")}</label>
              {selectedStore.manager.map((mgr, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder={t("sysadmin.manager_name")}
                    className="border px-3 py-2 mr-2 flex-1"
                    value={mgr.name}
                    onChange={(e) =>
                      handleManagerChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="email"
                    placeholder={t("sysadmin.manager_email")}
                    className="border px-3 py-2 mr-2 flex-1"
                    value={mgr.emailAddress}
                    onChange={(e) =>
                      handleManagerChange(index, "emailAddress", e.target.value)
                    }
                  />
                  <button
                    className="bg-white text-deleteC px-2 py-2 rounded hover:bg-deleteC hover:text-white ring-2 ring-gray-200 hover:ring-deleteC transition duration-200"
                    onClick={() => handleRemoveManager(index)}>
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
                onClick={handleAddManager}>
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
                  onClick={handleDeleteStore}>
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
                  onClick={handleCloseModal}>
                  <Icon
                    icon="material-symbols:cancel-outline-rounded"
                    width="36"
                    height="36"
                  />
                </button>
                <button
                  className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded mr-2 hover:bg-primaryColor hover:text-white"
                  onClick={handleSave}>
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
