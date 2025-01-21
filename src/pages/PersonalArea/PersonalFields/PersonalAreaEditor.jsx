import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

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
        <h2 className="text-xl font-bold mb-4">
          {t("personal_area.editprofile")}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.firstName")}
            </label>
            <input
              type="text"
              value={editedUser.first_name}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
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
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
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
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          {/* הוספת שדה מספר טלפון */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.phone")}
            </label>
            <input
              type="tel"
              value={editedUser.phoneNumber || ""}
              onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
              className="block w-full rounded-md border border-gray-800 bg-gray-100 px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
              placeholder={t("personal_area.phonePlaceholder")}
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => setIsEditing(false)}
            aria-label={t("personal_area.cancel")}
            className="bg-white text-gray-600 border-primaryColor rounded mr-2 rounded hover:bg-gray-600 hover:text-gray-300 hover:rounded-full">
            <Icon
              icon="material-symbols:cancel-outline-rounded"
              width="36"
              height="36"
            />
          </button>
          <button
            onClick={handleSave}
            aria-label={t("personal_area.save")}
            className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white hover:rounded-full">
            <Icon
              icon="material-symbols:check-circle-outline-rounded"
              width="36"
              height="36"
            />
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

        {/* הצגת מספר טלפון */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t("personal_area.phone")}
          </label>
          <p className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm px-2 py-1">
            {user.phoneNumber || t("personal_area.noPhone")}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={() => setIsEditing(true)}
          aria-label={t("personal_area.editprofile")}
          className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white">
          <Icon
            icon="material-symbols:person-edit-outline-rounded"
            width="36"
            height="36"
          />
        </button>
      </div>
    </div>
  );
};

export default PersonalAreaEditor;
