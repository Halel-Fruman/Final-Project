import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./PersonalArea.css";

const PersonalArea = ({ userId }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/User/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUser();
  }, [userId]);

  const handleEdit = (field) => {
    setEditingField(field);
    setNewValue(
      field.startsWith("addresses.") ? user.addresses[field.split(".")[1]] : user[field] || ""
    );
  };

  const handleSave = async () => {
    if (editingField === "password") {
      if (!currentPassword || newValue !== confirmPassword) {
        alert(t("personal_area.passwordMismatch"));
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: editingField,
          value:
            editingField === "password" ? { currentPassword, newPassword: newValue } : newValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${editingField}`);
      }

      const updatedUser = await response.json();
      if (editingField.startsWith("addresses.")) {
        const index = editingField.split(".")[1];
        const updatedAddresses = [...user.addresses];
        updatedAddresses[index] = newValue;
        setUser((prevUser) => ({ ...prevUser, addresses: updatedAddresses }));
      } else {
        setUser((prevUser) => ({ ...prevUser, [editingField]: newValue }));
      }

      setEditingField(null);
      setNewValue("");
      setCurrentPassword("");
      setConfirmPassword("");
      alert(t("personal_area.updateSuccess", { field: t(`personal_area.${editingField}`) }));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setNewValue("");
    setCurrentPassword("");
    setConfirmPassword("");
  };

  const handleAddAddress = async () => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/add-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to add address");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setNewValue("");
      alert(t("personal_area.addressAdded"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.addressAddFailed"));
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/delete-address`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const updatedAddresses = await response.json();
      setUser((prevUser) => ({ ...prevUser, addresses: updatedAddresses }));
      alert(t("personal_area.addressDeleted"));
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.addressDeleteFailed"));
    }
  };

  return user ? (
    <div className="container mt-5">
      <h1 className="text-center">
        {t("personal_area.welcome", { username: user.first_name || user.email })}
      </h1>

      {/* Personal Info */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5>{t("personal_area.userInfo")}</h5>
              <p>
                <strong>{t("personal_area.email")}: </strong>
                {user.email}
              </p>
              <p>
                <strong>{t("personal_area.firstName")}: </strong>
                {editingField === "first_name" ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <button className="btn btn-success me-2" onClick={handleSave}>
                      {t("personal_area.save")}
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      {t("personal_area.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    {user.first_name}
                    <button className="btn btn-link" onClick={() => handleEdit("first_name")}>
                      {t("personal_area.edit")}
                    </button>
                  </>
                )}
              </p>
              <p>
                <strong>{t("personal_area.lastName")}: </strong>
                {editingField === "last_name" ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <button className="btn btn-success me-2" onClick={handleSave}>
                      {t("personal_area.save")}
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      {t("personal_area.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    {user.last_name}
                    <button className="btn btn-link" onClick={() => handleEdit("last_name")}>
                      {t("personal_area.edit")}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5>{t("personal_area.changePassword")}</h5>
              {editingField === "password" ? (
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
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
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
                <button className="btn btn-link" onClick={() => handleEdit("password")}>
                  {t("personal_area.changePassword")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>{t("personal_area.yourAddresses")}</h5>
          {user.addresses?.length > 0 ? (
            user.addresses.map((address, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                <span>{address}</span>
                <div>
                  <button className="btn btn-link" onClick={() => handleEdit(`addresses.${index}`)}>
                    {t("personal_area.edit")}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(index)}>
                    {t("personal_area.delete")}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>{t("personal_area.noAddresses")}</p>
          )}
          <input
            type="text"
            className="form-control mb-2"
            placeholder={t("personal_area.addNewAddress")}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddAddress}>
            {t("personal_area.addAddress")}
          </button>
        </div>
      </div>

      {/* Cart & Wishlist */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5>{t("personal_area.yourCart")}</h5>
              {user.cart?.length > 0 ? (
                user.cart.map((item, index) => (
                  <p key={index}>
                    {t("personal_area.productId")}: {item.productId}, {t("personal_area.quantity")}: {item.quantity}
                  </p>
                ))
              ) : (
                <p>{t("personal_area.noItemsCart")}</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5>{t("personal_area.yourWishlist")}</h5>
              {user.wishlist?.length > 0 ? (
                user.wishlist.map((item, index) => (
                  <p key={index}>{item}</p>
                ))
              ) : (
                <p>{t("personal_area.noItemsWishlist")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-center">{t("personal_area.loading")}</p>
  );
};

export default PersonalArea;
