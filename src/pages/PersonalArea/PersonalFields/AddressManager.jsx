import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { addAddress, editAddress, deleteAddress } from "../../../utils/Address";

const AddressManager = ({ addresses, userId, onUpdate, token }) => {
  const { t } = useTranslation();
  const [newCity, setNewCity] = useState("");
  const [newStreetAddress, setNewStreetAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCity, setEditingCity] = useState("");
  const [editingStreetAddress, setEditingStreetAddress] = useState("");

  const handleAddAddress = async () => {
    try {
      const updatedAddresses = await addAddress({
        userId,
        token,
        address: {
          city: newCity,
          streetAddress: newStreetAddress,
        },
      });
      onUpdate(updatedAddresses);
      setNewCity("");
      setNewStreetAddress("");
      setShowAddAddress(false);
      alert(t("personal_area.alerts.addressAdded"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.alerts.addError"));
    }
  };

  const handleEditAddress = async () => {
    try {
      const updated = [...addresses];
      updated[editingIndex] = {
        city: editingCity,
        streetAddress: editingStreetAddress,
      };
      const updatedAddresses = await editAddress({ userId, token, updated });
      onUpdate(updatedAddresses);
      setEditingIndex(null);
      setEditingCity("");
      setEditingStreetAddress("");
      alert(t("personal_area.alerts.updateSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.alerts.updateError"));
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updatedAddresses = await deleteAddress({userId, token, index});
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
          <label htmlFor="address">
            <h2 className="text-xl font-bold mb-4">
              {t("personal_area.fields.addresses")}
            </h2>
          </label>
          {addresses?.length > 0 ? (
            addresses.map((address, index) => (
              <div key={index} className="card mb-3 p-2">
                <div className="flex text-lg justify-between items-center">
                  {editingIndex === index ? (
                    <>
                      <input
                        id="editCity"
                        type="text"
                        className="w-1/4 bg-gray-100 p-4 rounded-md shadow-sm mx-1"
                        placeholder={t("addAddress.city")}
                        value={editingCity}
                        onChange={(e) => setEditingCity(e.target.value)}
                      />
                      <input
                        id="editStreet"
                        type="text"
                        className="w-1/4 bg-gray-100 p-4 rounded-md shadow-sm mx-1"
                        placeholder={t("addAddress.address")}
                        value={editingStreetAddress}
                        onChange={(e) =>
                          setEditingStreetAddress(e.target.value)
                        }
                      />
                      <button
                        className="bg-white m-3 text-primaryColor rounded-full hover:bg-primaryColor hover:text-white"
                        aria-label={t("personal_area.actions.save")}
                        onClick={handleEditAddress}>
                        <Icon
                          icon="material-symbols:check-circle-outline-rounded"
                          width="36"
                          height="36"
                        />
                      </button>
                      <button
                        className="bg-white m-3 text-gray-600 rounded hover:bg-gray-600 hover:text-white"
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
                      <span className="w-2/4 bg-gray-100 p-4 rounded-md shadow-sm">
                        {address.city}, {address.streetAddress}
                      </span>
                      <div>
                        <button
                          className="bg-white m-3 text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                          aria-label="Edit"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingCity(address.city);
                            setEditingStreetAddress(address.streetAddress);
                          }}>
                          <Icon
                            icon="tabler:home-edit"
                            width="36"
                            height="36"
                          />
                        </button>
                        <button
                          className="bg-white m-3 text-deleteC rounded hover:bg-deleteC hover:text-white"
                          aria-label="Delete"
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
            <div className="card text-lg mt-3 p-2 gap-4">
              <input
                type="text"
                className="w-1/4 bg-gray-100 p-4 rounded-md shadow-sm"
                placeholder={t("addAddress.city")}
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <input
                type="text"
                className="w-1/4 bg-gray-100 m-2 p-4 rounded-md shadow-sm"
                placeholder={t("addAddress.address")}
                value={newStreetAddress}
                onChange={(e) => setNewStreetAddress(e.target.value)}
              />
              <button
                className="bg-white m-3 text-primaryColor rounded-full hover:bg-primaryColor hover:text-white"
                onClick={handleAddAddress}
                aria-label={t("personal_area.actions.add")}>
                <Icon
                  icon="material-symbols:check-circle-outline-rounded"
                  width="36"
                  height="36"
                />
              </button>
              <button
                className="bg-white m-3 text-gray-600 rounded hover:bg-gray-600 hover:text-white"
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
