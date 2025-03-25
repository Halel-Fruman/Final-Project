import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const WishlistModal = ({
  isOpen,
  onClose,
  wishlist,
  fetchProductDetails,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!wishlist || wishlist.length === 0) {
        setProducts([]);
        return;
      }

      const productData = await Promise.all(
        wishlist.map((item) => fetchProductDetails(item.productId))
      );

      const validProducts = productData.filter(
        (p) => p !== null && p !== undefined
      );
      setProducts(validProducts);
    };

    if (isOpen) loadProducts();
  }, [isOpen, wishlist, fetchProductDetails]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">❤️ {t("wishlist.title")}</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">{t("wishlist.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {products.map((product) => (
              <li
                key={product._id}
                className="flex items-center gap-4 border p-3 rounded-xl shadow-sm hover:bg-gray-50 transition">
                <img
                  src={product.images?.[0] || "https://placehold.co/60"}
                  alt={product.name[i18n.language]}
                  className="w-14 h-14 object-cover rounded-full"
                />

                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {product.name[i18n.language]}
                  </h3>
                  <p className="text-xs text-gray-600">₪{product.price}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onAddToCart({ productId: product._id, quantity: 1 });
                      toast.success(t("wishlist.addToCart") + " ✅");
                      onRemoveFromWishlist(product);
                    }}
                    className="bg-secondaryColor text-white p-2 rounded-full shadow hover:bg-primaryColor transition"
                    title={t("wishlist.addToCart")}>
                    <Icon
                      icon="material-symbols:add-shopping-cart-rounded"
                      width="20"
                      height="20"
                    />
                  </button>
                  <button
                    onClick={() => {
                      onRemoveFromWishlist(product);
                      toast.success(t("wishlist.remove") + " ❌");
                    }}
                    className="bg-white text-deleteC p-2 ring-1 ring-deleteC rounded-full hover:bg-deleteC hover:text-white transition"
                    title={t("wishlist.remove")}>
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="20"
                      height="20"
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

export default WishlistModal;
