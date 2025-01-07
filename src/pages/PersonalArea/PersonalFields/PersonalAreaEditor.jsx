import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AddressManager from "./AddressManager";

const PersonalAreaEditor = ({ user, onSave, onCancel, onAddressUpdate }) => {
  const { t } = useTranslation();
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log("Final user data before save:", editedUser);
    try {
      await onSave(editedUser);
      alert(t("personal_area.updateSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };



  return (
    <div className="container mt-5">
      <h1 className="text-center">{t("personal_area.welcome", { username: user.first_name })}</h1>

      {/* User Details */}
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



      {/* Buttons */}
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
