import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// The PasswordManager component is a functional component that takes the userId and token as props.
const PasswordManager = ({ userId, token }) => {
  const { t } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t
  const [isEditing, setIsEditing] = useState(false); // useState hook to store the editing state
  const [currentPassword, setCurrentPassword] = useState(""); // useState hook to store the current password
  const [newPassword, setNewPassword] = useState(""); // useState hook to store the new password
  const [confirmPassword, setConfirmPassword] = useState(""); // useState hook to store the confirm password

  // handlePasswordChange function to send a PUT request to the server to change the user's password
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert(t("personal_area.passwordMismatch"));
      return;
    }
    // Try to send a PUT request to the server to change the user's password
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      alert(
        t("personal_area.updateSuccess", { field: t("personal_area.password") })
      );
      setIsEditing(false); // Set the editing state to false
      setCurrentPassword(""); // Clear the current password
      setNewPassword(""); // Clear the new password
      setConfirmPassword(""); // Clear the confirm password
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };
  // Return the password manager form with the current password, new password, confirm password, and save and cancel buttons
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
          <button
            className="btn btn-success me-2"
            onClick={handlePasswordChange}>
            {t("personal_area.save")}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(false)}>
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
