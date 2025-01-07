import React from "react";
import { useTranslation } from "react-i18next";

const CartAndWishlist = ({ cart, wishlist }) => {
  const { t } = useTranslation();

  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5>{t("personal_area.yourCart")}</h5>
            {cart?.length > 0 ? (
              cart.map((item, index) => (
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
            {wishlist?.length > 0 ? (
              wishlist.map((item, index) => <p key={index}>{item}</p>)
            ) : (
              <p>{t("personal_area.noItemsWishlist")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartAndWishlist;
