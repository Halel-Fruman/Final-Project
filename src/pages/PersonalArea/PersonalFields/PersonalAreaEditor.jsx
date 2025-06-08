import  { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

// The PersonalAreaEditor component is a functional component that takes the user, setUser, and onSave as props.
const PersonalAreaEditor = ({ user, setUser, onSave }) => {
  const { t } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t
  const [isEditing, setIsEditing] = useState(false); // useState hook to store the editing state
  const [editedUser, setEditedUser] = useState({ ...user }); // useState hook to store the edited user data

  // handleFieldChange function to update the edited user data based on the field and value
  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  // handleSave function to send a request to the server to save the updated user data
  const handleSave = async () => {
    try {
      await onSave(editedUser); // Call the onSave function with the edited user data
      setUser(editedUser); // Update the user state with the edited user data
      setIsEditing(false); // Set the editing state to false
      alert(t("personal_area.updateSuccess"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };
  // Return the personal area editor form with the first name, last name, email, phone number, and save and cancel buttons
  if (isEditing) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          {t("personal_area.editprofile")}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.firstName")}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={editedUser.first_name}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.lastName")}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={editedUser.last_name}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2">
              {t("personal_area.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={editedUser.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="block w-full rounded-md border border-gray-800 bg-gray-100  px-2 py-1 shadow-sm focus:ring-secondaryColor focus:border-secondaryColor"
            />
          </div>

          {/* show phone number */}
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
  // Return the personal area details with the user data and edit button
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

        {/*show phone number */}
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
