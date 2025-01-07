import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const AddressManager = ({ addresses, userId, onUpdate }) => {
  const { t } = useTranslation();
  const [newAddress, setNewAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddAddress = async () => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/add-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress }),
      });

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
      const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: `addresses.${editingIndex}`, value: editingValue }),
      });

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
      const response = await fetch(`http://localhost:5000/User/${userId}/delete-address`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });

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
          <h5>{t("personal_area.fields.addresses")}</h5>
          {addresses?.length > 0 ? (
            addresses.map((address, index) => (
              <div
                key={index}
                className="card mb-3 p-2"
              >
                <div className="d-flex justify-content-between align-items-center">
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="form-control me-2"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                      />
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={handleEditAddress}
                      >
                        {t("personal_area.actions.save")}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingIndex(null)}
                      >
                        {t("personal_area.actions.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{address}</span>
                      <button
                        className="btn btn-link btn-sm me-2"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingValue(address);
                        }}
                      >
                        {t("personal_area.actions.edit")}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteAddress(index)}
                      >
                        {t("personal_area.actions.delete")}
                      </button>
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
                className="form-control me-2"
                placeholder={t("personal_area.actions.addAddress")}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <button className="btn btn-success me-2" onClick={handleAddAddress}>
                {t("personal_area.actions.add")}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddAddress(false)}
              >
                {t("personal_area.actions.cancel")}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary mt-3"
              onClick={() => setShowAddAddress(true)}
            >
              {t("personal_area.actions.add")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
