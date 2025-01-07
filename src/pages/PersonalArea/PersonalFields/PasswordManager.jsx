import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PasswordManager = ({ userId }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    if (!currentPassword || newPassword !== confirmPassword) {
      alert(t("personal_area.passwordMismatch"));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: "password",
          value: { currentPassword, newPassword },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      alert(t("personal_area.updateSuccess", { field: t("personal_area.password") }));
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="mb-3">
      <h5>{t("personal_area.changePassword")}</h5>
      {editing ? (
        <>
          <input
            type="password"
            className="form-control mb-2"
            placeholder={t("personal_area.currentPassword")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder={t("personal_area.newPassword")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder={t("personal_area.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="btn btn-success me-2" onClick={handleSave}>
            {t("personal_area.save")}
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            {t("personal_area.cancel")}
          </button>
        </>
      ) : (
        <button className="btn btn-link" onClick={() => setEditing(true)}>
          {t("personal_area.changePassword")}
        </button>
      )}
    </div>
  );
};

export default PasswordManager;
