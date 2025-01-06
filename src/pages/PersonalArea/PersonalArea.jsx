import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./PersonalArea.css";

const PersonalArea = ({ userId }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

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

  return user ? (
    <div className="personal-area-container">
      <h1>{t("personal_area.welcome")}</h1>
      <div className="user-info">

        <p>
          <span>{t("personal_area.email")}:</span> {user.email}
        </p>
      </div>
      <div className="section">
        <h2>{t("personal_area.yourCart")}</h2>
        {user.cart.length > 0 ? (
          user.cart.map((item, index) => (
            <div key={index} className="item">
              <p>
                <strong>{t("personal_area.productId")}:</strong> {item.productId}
              </p>
              <p>
                <strong>{t("personal_area.quantity")}:</strong> {item.quantity}
              </p>
            </div>
          ))
        ) : (
          <p>{t("personal_area.noItemsCart")}</p>
        )}
      </div>
      <div className="section">
        <h2>{t("personal_area.yourWishlist")}</h2>
        {user.wishlist.length > 0 ? (
          user.wishlist.map((item, index) => (
            <div key={index} className="item">
              <p>
                <strong>{t("personal_area.productId")}:</strong> {item}
              </p>
            </div>
          ))
        ) : (
          <p>{t("personal_area.noItemsWishlist")}</p>
        )}
      </div>
    </div>
  ) : (
    <p>{t("personal_area.loading")}</p>
  );
};

export default PersonalArea;
