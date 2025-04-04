import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PasswordManager = ({ userId, token }) => {
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

      if (!response.ok) throw new Error("Failed to change password");

      alert(
        t("personal_area.updateSuccess", {
          field: t("personal_area.passwordManagement"),
        })
      );
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
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {t("personal_area.passwordManagement")}
      </h2>

      {
        <div className="space-y-4">
          <input
            type="password"
            placeholder={t("personal_area.currentPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t("personal_area.newPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t("personal_area.confirmPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-2">
            <button
              className="bg-primaryColor text-white font-bold text-xl px-4 py-2 rounded hover:bg-secondaryColor transition"
              onClick={handlePasswordChange}>
              {t("personal_area.save")}
            </button>

          </div>
        </div>
      }
    </div>
  );
};

export default PasswordManager;
