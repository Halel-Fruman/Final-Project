import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

const AddressManager = ({ addresses, userId, onUpdate,token }) => {
  const { t } = useTranslation();
  const [newAddress, setNewAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddAddress = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/add-address`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: newAddress }),
        }
      );

      if (!response.ok) {
        throw new Error(t("personal_area.alerts.addError"));
      }

      const updatedAddresses = await response.json();
      onUpdate(updatedAddresses);
      setNewAddress("");
      setShowAddAddress(false);
      alert(t("personal_area.alerts.addressAdded"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.alerts.addError"));
    }
  };

  const handleEditAddress = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/edit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field: `addresses.${editingIndex}`,
            value: editingValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("personal_area.alerts.updateError"));
      }

      const updatedAddresses = await response.json();
      onUpdate(updatedAddresses);
      setEditingIndex(null);
      setEditingValue("");
      alert(t("personal_area.alerts.updateSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.alerts.updateError"));
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/delete-address`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // הוסף את ה-token לכותרות
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index }),
        }
      );

      if (!response.ok) {
        throw new Error(t("personal_area.alerts.deleteError"));
      }

      const updatedAddresses = await response.json();
      onUpdate(updatedAddresses);
      alert(t("personal_area.alerts.deleteSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.alerts.deleteError"));
    }
  };

  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-body">
          <h5 className="text-xl font-bold mb-4">
            {t("personal_area.fields.addresses")}
          </h5>
          {addresses?.length > 0 ? (
            addresses.map((address, index) => (
              <div key={index} className="card mb-3 p-2">
                <div className="d-flex justify-content-between align-items-center">
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="w-1/3 block rounded-md border-4 border-gray-800 bg-gray-100 shadow-sm px-2 py-1"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                      />
                      <button
                        className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white hover:rounded-full"
                        aria-label={t("personal_area.actions.save")}
                        onClick={handleEditAddress}>
                        <Icon
                          icon="material-symbols:check-circle-outline-rounded"
                          width="36"
                          height="36"
                        />
                      </button>
                      <button
                        className="bg-white text-gray-600  border-primaryColor rounded mr-2 rounded hover:bg-gray-600 hover:text-gray-300 hover:rounded-full "
                        aria-label={t("personal_area.actions.cancel")}
                        onClick={() => setEditingIndex(null)}>
                        <Icon
                          icon="material-symbols:cancel-outline-rounded"
                          width="36"
                          height="36"
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="w-1/3 block rounded-md border-2 border-gray-300 bg-gray-100 shadow-sm px-2 py-1">
                        {address}
                      </span>
                      <div>
                        <button
                          className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingValue(address);
                          }}>
                          <Icon
                            icon="tabler:home-edit"
                            width="36"
                            height="36"
                          />{" "}
                        </button>
                        <button
                          className="bg-white text-deleteC  rounded hover:bg-deleteC hover:text-white "
                          onClick={() => handleDeleteAddress(index)}>
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="36"
                            height="36"
                          />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>{t("personal_area.alerts.noAddresses")}</p>
          )}
          {showAddAddress ? (
            <div className="d-flex mt-3">
              <input
                type="text"
                className="w-1/3 block rounded-md border-4 border-gray-800 bg-gray-100 shadow-sm px-2 py-1"
                placeholder={t("personal_area.actions.addAddress")}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <button
                className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                onClick={handleAddAddress}
                aria-label={t("personal_area.actions.add")}>
                <Icon
                  icon="material-symbols:check-circle-outline-rounded"
                  width="36"
                  height="36"
                />
              </button>
              <button
                className="bg-white text-gray-600  border-primaryColor rounded mr-2 rounded hover:bg-gray-600 hover:text-gray-300 hover:rounded-full "
                aria-label={t("personal_area.actions.cancel")}
                onClick={() => setShowAddAddress(false)}>
                <Icon
                  icon="material-symbols:cancel-outline-rounded"
                  width="36"
                  height="36"
                />
              </button>
            </div>
          ) : (
            <button
              className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white"
              aria-label={t("personal_area.actions.add")}
              onClick={() => setShowAddAddress(true)}>
              <Icon
                icon="material-symbols:add-home-outline-rounded"
                width="36"
                height="36"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
