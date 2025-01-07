import React, { useEffect, useState } from "react";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor"; // ייבוא הקובץ לעריכת פרטים אישיים
import PasswordManager from "./PersonalFields/PasswordManager"; // ייבוא הקובץ לניהול סיסמאות
import CartAndWishlist from "./PersonalFields/CartAndWishlist"; // ייבוא הקובץ לניהול עגלה ורשימת משאלות
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

  return user ? (
    <div className="container mt-5">
      <h1>{t("personal_area.welcome", { username: user.first_name })}</h1>
      <button className="btn btn-primary mb-4" onClick={() => setIsEditing(true)}>
        {t("personal_area.editprofile")}
      </button>

      {/* עורך פרטי משתמש */}
      {isEditing && (
        <PersonalAreaEditor
          user={user}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* ניהול סיסמאות */}
      <PasswordManager userId={userId} />

      {/* עגלה ורשימת משאלות */}
      <CartAndWishlist cart={user.cart} wishlist={user.wishlist} />
    </div>
  ) : (
    <p>{t("personal_area.loading")}</p>
  );
};

export default PersonalArea;
