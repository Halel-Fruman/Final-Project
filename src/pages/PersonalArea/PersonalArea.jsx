import React, { useEffect, useState } from "react";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor"; // ייבוא הקובץ החדש
import { useTranslation } from "react-i18next";

const PersonalArea = ({ userId }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedUser }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedData = await response.json();
      setUser(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.updateFailed"));
    }
  };

  const handleAddressUpdate = async (updatedAddresses) => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/update-addresses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (!response.ok) {
        throw new Error("Failed to update addresses");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err.message);
      alert(t("personal_area.addressUpdateFailed"));
    }
  };

  return user ? (
    isEditing ? (
      <PersonalAreaEditor
        user={user}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onAddressUpdate={handleAddressUpdate}
      />
    ) : (
      <div className="container mt-5">
        <h1>{t("personal_area.welcome", { username: user.first_name })}</h1>
        <button className="btn btn-primary mb-4" onClick={() => setIsEditing(true)}>
          {t("personal_area.editprofile")}
        </button>

        {/* עגלת קניות */}
        <div className="mb-4">
          <h5>{t("personal_area.yourCart")}</h5>
          {user.cart?.length > 0 ? (
            user.cart.map((item, index) => (
              <p key={index}>
                {t("personal_area.productId")}: {item.productId}, {t("personal_area.quantity")}:{" "}
                {item.quantity}
              </p>
            ))
          ) : (
            <p>{t("personal_area.noItemsCart")}</p>
          )}
        </div>

        {/* רשימת משאלות */}
        <div className="mb-4">
          <h5>{t("personal_area.yourWishlist")}</h5>
          {user.wishlist?.length > 0 ? (
            user.wishlist.map((item, index) => <p key={index}>{item}</p>)
          ) : (
            <p>{t("personal_area.noItemsWishlist")}</p>
          )}
        </div>
      </div>
    )
  ) : (
    <p>{t("personal_area.loading")}</p>
  );
};

export default PersonalArea;
