import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useAlert } from "../../components/AlertDialog.jsx";

// The SysAdmin component is a functional component
const SysAdmin = () => {
  const { t } = useTranslation(); // The useTranslation hook is used to access the i18n instance
  const [stores, setStores] = useState([]); // The stores state is used to store the list of stores
  const [selectedStore, setSelectedStore] = useState(null); // Store selected for editing
  const [isModalOpen, setIsModalOpen] = useState(false); // Flag for modal open
  const [newStoreMode, setNewStoreMode] = useState(false); // Flag for new store mode
  const { showAlert } = useAlert(); // The useAlert hook is used to show an alert dialog

  // The useEffect hook is used to fetch the list of stores when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/Stores/")
      .then((res) => {
        console.log("Stores fetched:", res.data);

        // Set the list of stores in the state
        setStores(Object.values(res.data));
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בשרת, אנא נסה שנית.", "error");
      });
  }, []);

  const handleOpenModal = (store = null) => {
    setSelectedStore(
      store || {
        name: "",
        address: "",
        email: "",
        manager: [{ name: "", emailAddress: "" }],
      }
    );
    setNewStoreMode(!store); // Set the new store mode if no store is passed
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  // Function to handle field changes
  const handleFieldChange = (field, value) => {
    setSelectedStore({ ...selectedStore, [field]: value });
  };

  // Function to handle manager changes
  const handleManagerChange = (index, field, value) => {
    const updatedManagers = [...selectedStore.manager];
    updatedManagers[index][field] = value;
    setSelectedStore({ ...selectedStore, manager: updatedManagers });
  };

  // Function to validate email
  const isEmailValid = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Function to check if email is unique
  const isEmailUnique = (email, managers) => {
    const existingEmails = managers.map((manager) => manager.emailAddress);
    return !existingEmails.includes(email);
  };

  // Function to check if name is valid
  const isNameValid = (name) => {
    return name.trim().length > 0;
  };
  const isStoreNameValid = (name) => {
    const hebrewPattern = /^[\u0590-\u05FFa-zA-Z0-9\s-]+$/; // Hebrew, English, numbers, spaces, and hyphens
    return name.trim().length > 0 && hebrewPattern.test(name);
  };

  // Function to check if store name is unique
  const isStoreNameUnique = (name, stores, currentStoreId = null) => {
    const normalizedNewName = name.trim().normalize("NFKC"); // Normalize the name for comparison

    return !stores.some(
      (store) =>
        store._id !== currentStoreId && // Exclude the current store from the check
        store.name.trim().normalize("NFKC") === normalizedNewName
    );
  };

  // Function to check if address is valid
  const isAddressValid = (address) => address.trim().length > 0;

  // Function to add a manager
  const handleAddManager = () => {
    setSelectedStore({
      ...selectedStore,
      manager: [...selectedStore.manager, { name: "", emailAddress: "" }],
    });
  };

  // Function to save the store
  const handleSave = () => {
    if (!isStoreNameValid(selectedStore.name)) {
      showAlert("שם החנות לא יכול להיות ריק.", "error");
      return;
    }

    //check if store name is unique
    if (!isStoreNameUnique(selectedStore.name, stores, selectedStore._id)) {
      showAlert("שם החנות כבר קיים במערכת. בחר שם אחר.", "error");
      return;
    }
    // check if address is valid
    if (!isAddressValid(selectedStore.address)) {
      showAlert("כתובת החנות לא יכולה להיות ריקה.", "error");
      return;
    }

    // check if email is valid
    if (!isEmailValid(selectedStore.email)) {
      showAlert("כתובת המייל של החנות אינה תקינה.", "error");
      return;
    }
    // check if there is at least one manager
    if (selectedStore.manager.length === 0) {
      showAlert("על כל חנות להיות עם לפחות מנהל אחד.", "error");
      return;
    }

    // check if managers are valid
    const invalidManagers = selectedStore.manager.filter(
      (manager, index, managers) =>
        !isEmailValid(manager.emailAddress) ||
        !isNameValid(manager.name) ||
        !isEmailUnique(manager.emailAddress, managers.slice(0, index))
    );
    // check if there are invalid managers
    if (invalidManagers.length > 0) {
      showAlert(
        "יש מנהלים עם קלט לא תקין. ודא שמילאת את כל השדות בצורה נכונה.",
        "error"
      );
      return;
    }

    // Send a POST request to the server with the store data if new store mode is enabled
    const url = newStoreMode
      ? "http://localhost:5000/Stores/"
      : `http://localhost:5000/Stores/${selectedStore._id}`;
    const method = newStoreMode ? "post" : "put";

    axios[method](url, selectedStore)
      .then((res) => {
        if (newStoreMode) {
          setStores([...stores, res.data]); // Add the new store to the list

          showAlert("החנות נוספה בהצלחה!", "success"); // show success message for adding store
        } else {
          setStores(
            stores.map((store) =>
              store._id === selectedStore._id ? res.data : store
            )
          );
          showAlert("החנות עודכנה בהצלחה!", "success"); // show success message for updating store
        }
        handleCloseModal();
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת שמירת החנות.", "error"); // show error message for saving store
      });
  };

  // Function to delete the store
  const handleDeleteStore = () => {
    showAlert(
      "האם אתה בטוח שברצונך למחוק את החנות?",

      "warning",
      () => {
        axios
          .delete(`http://localhost:5000/Stores/${selectedStore._id}`)
          .then(() => {
            setStores(
              stores.filter((store) => store._id !== selectedStore._id)
            );
            handleCloseModal();
            showAlert(" החנות נמחקה בהצלחה!", "success");
          })
          .catch((err) => {
            console.log(err);
            showAlert(" אירעה שגיאה בעת מחיקת החנות.", "error");
          });
      }
    );
  };

  // Function to remove a manager
  const handleRemoveManager = (index) => {
    // check if there is at least one manager
    if (selectedStore.manager.length === 1) {
      showAlert(
        "לא ניתן למחוק את המנהל האחרון. על כל חנות להיות עם לפחות מנהל אחד.",
        "error"
      );
      return;
    }
    // show alert dialog to confirm manager deletion
    showAlert(
      "האם אתה בטוח שברצונך למחוק את המנהל?",

      "warning",
      () => {
        const updatedManagers = selectedStore.manager.filter(
          (_, i) => i !== index
        );
        setSelectedStore({ ...selectedStore, manager: updatedManagers });
      },

      () => console.log("בוטל")
    );
  };

  // The return statement contains the JSX of the SysAdmin component
  return (
    <div className="container mx-auto p-5">
      <header className="text-center mb-8">
        <h1 className="text-3xl text-primaryColor  font-bold">
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
          />{" "}
        </button>
      </div>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-primaryColor  text-white ">
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
              <td className="border px-4 py-2">{store.name}</td>
              <td className="border px-4 py-2">{store.address}</td>
              <td className="border px-4 py-2">{store.email}</td>
              <td className="border px-4 py-2">
                {store.manager.map((mgr, index) => (
                  <div key={index}>{mgr.name}</div>
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
                  />{" "}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-1/2">
            <h2 className="text-3xl font-bold mb-4 items-center text-center">
              {newStoreMode
                ? t("sysadmin.add_store")
                : t("sysadmin.edit_store")}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">{t("sysadmin.store_name")}</label>
              <input
                type="text"
                className="w-full border px-3 py-2"
                value={selectedStore.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
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
                className=" text-black px-2 py-2 rounded mt-2 flex items-center rounded hover:bg-primaryColor hover:text-white "
                onClick={handleAddManager}>
                <Icon
                  icon="material-symbols:add-circle-outline-rounded"
                  width="24"
                  height="24"
                />{" "}
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
                  className="bg-white text-gray-600 px-2 py-2 border-primaryColor rounded mr-2 rounded hover:bg-gray-600 hover:text-gray-300 "
                  onClick={handleCloseModal}>
                  <Icon
                    icon="material-symbols:cancel-outline-rounded"
                    width="36"
                    height="36"
                  />
                </button>
                <button
                  className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded mr-2 rounded hover:bg-primaryColor hover:text-gray-300 "
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
