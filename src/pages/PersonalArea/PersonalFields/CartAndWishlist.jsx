import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CartAndWishlist = ({ cart, initialWishlist }) => {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState(initialWishlist || []);

  const handleAddToWishlist = (productId) => {
    if (!wishlist.includes(productId)) {
      setWishlist((prev) => [...prev, productId]);
      alert(t("wishlist.added", { productId }));
    } else {
      alert(t("wishlist.alreadyExists", { productId }));
    }
  };

  return (
    <div className="row">
      {/* Cart Section */}
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5>{t("personal_area.yourCart")}</h5>
            {cart?.length > 0 ? (
              cart.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                  <p>
                    {t("personal_area.productId")}: {item.productId}, {t("personal_area.quantity")}: {item.quantity}
                  </p>
                  <button
                    onClick={() => handleAddToWishlist(item.productId)}
                    className="btn btn-sm btn-outline-primary"
                  >
                    {t("wishlist.addButton")}
                  </button>
                </div>
              ))
            ) : (
              <p>{t("personal_area.noItemsCart")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5>{t("personal_area.yourWishlist")}</h5>
            {wishlist?.length > 0 ? (
              wishlist.map((item, index) => (
                <p key={index} className="mb-2">
                  {t("personal_area.productId")}: {item}
                </p>
              ))
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
