import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PasswordManager = ({ userId }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert(t("personal_area.passwordMismatch"));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      alert(t("personal_area.updateSuccess", { field: t("personal_area.password") }));
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  return (
      <div className="card-body">
        {isEditing ? (
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
            <button className="btn btn-success me-2" onClick={handlePasswordChange}>
              {t("personal_area.save")}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              {t("personal_area.cancel")}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            {t("personal_area.changePassword")}
          </button>
        )}
    </div>
  );
};

export default PasswordManager;
