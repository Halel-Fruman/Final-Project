import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PersonalAreaEditor = ({ user, setUser, onSave }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave(editedUser);
      setUser(editedUser); // עדכון נתוני המשתמש לאחר שמירה
      setIsEditing(false); // חזרה למצב תצוגה
      alert(t("personal_area.updateSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  if (isEditing) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">{t("personal_area.editprofile")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.firstName")}
            </label>
            <input
              type="text"
              value={editedUser.first_name}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.lastName")}
            </label>
            <input
              type="text"
              value={editedUser.last_name}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.email")}
            </label>
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {t("personal_area.cancel")}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-secondaryColor text-white rounded hover:bg-blue-600"
          >
            {t("personal_area.save")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("personal_area.myDetails")}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t("personal_area.firstName")}
          </label>
          <p className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm px-2 py-1">
            {user.first_name}
          </p>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t("personal_area.lastName")}
          </label>
          <p className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm px-2 py-1">
            {user.last_name}
          </p>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t("personal_area.email")}
          </label>
          <p className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm px-2 py-1">
            {user.email}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-secondaryColor text-white rounded hover:bg-primaryColor"
        >
          {t("personal_area.editprofile")}
        </button>
      </div>
    </div>
  );
};

export default PersonalAreaEditor;
