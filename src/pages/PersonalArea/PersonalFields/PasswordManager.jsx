import  { useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchWithTokenRefresh } from "../../../utils/authHelpers";

const PasswordManager = ({ userId, token }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert(t("personal_area.passwordMismatch"));
      return;
    }

    try {
      const response = await fetchWithTokenRefresh(
        `/api/User/${userId}/change-password`,
        {
          method: "PUT",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) throw new Error("Failed to change password");

      alert(
        t("personal_area.updateSuccess", {
          field: t("personal_area.passwordManagement"),
        })
      );
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
        <form className="space-y-4">
          <input
            type="password"
            placeholder={t("personal_area.currentPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t("personal_area.newPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={newPassword}
            autoComplete="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t("personal_area.confirmPassword")}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-2">
            <button
              className="bg-primaryColor text-white font-bold text-xl px-4 py-2 rounded-full hover:bg-secondaryColor transition"
              onClick={handlePasswordChange}>
              {t("personal_area.save")}
            </button>
          </div>
        </form>
      }
    </div>
  );
};

export default PasswordManager;
