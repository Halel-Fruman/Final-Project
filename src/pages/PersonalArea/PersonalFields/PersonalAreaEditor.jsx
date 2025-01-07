import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PersonalAreaEditor = ({ user, onSave, onCancel, onAddressUpdate }) => {
  const { t } = useTranslation();
  const [editedUser, setEditedUser] = useState({ ...user });
  const [newAddress, setNewAddress] = useState("");

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave(editedUser);
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  const handleAddAddress = async () => {
    try {
      const updatedAddresses = await onAddressUpdate([...editedUser.addresses, newAddress]);
      setEditedUser((prev) => ({ ...prev, addresses: updatedAddresses }));
      setNewAddress("");
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.addressAddFailed"));
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updatedAddresses = await onAddressUpdate(
        editedUser.addresses.filter((_, i) => i !== index)
      );
      setEditedUser((prev) => ({ ...prev, addresses: updatedAddresses }));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.addressDeleteFailed"));
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">{t("personal_area.welcome", { username: user.first_name })}</h1>

      {/* פרטי משתמש */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>{t("personal_area.userInfo")}</h5>
          <div className="mb-3">
            <label>{t("personal_area.firstName")}</label>
            <input
              type="text"
              className="form-control"
              value={editedUser.first_name}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>{t("personal_area.lastName")}</label>
            <input
              type="text"
              className="form-control"
              value={editedUser.last_name}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>{t("personal_area.email")}</label>
            <input
              type="email"
              className="form-control"
              value={editedUser.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* כתובות */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>{t("personal_area.yourAddresses")}</h5>
          {editedUser.addresses?.map((address, index) => (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span>{address}</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteAddress(index)}
              >
                {t("personal_area.delete")}
              </button>
            </div>
          ))}
          <div className="d-flex mt-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder={t("personal_area.addNewAddress")}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddAddress}>
              {t("personal_area.addNewAddress")}
            </button>
          </div>
        </div>
      </div>

      {/* כפתורים */}
      <div className="d-flex justify-content-center">
        <button className="btn btn-success me-3" onClick={handleSave}>
          {t("personal_area.save")}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t("personal_area.cancel")}
        </button>
      </div>
    </div>
  );
};

export default PersonalAreaEditor;
