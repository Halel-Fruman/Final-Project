import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogPanel } from "@headlessui/react";
import { useTranslation } from "react-i18next";

const CartModal = ({ isOpen, onClose, cartItems, onRemoveFromCart, fetchProductDetails }) => {
  const { t, i18n } = useTranslation();
  const [detailedCartItems, setDetailedCartItems] = useState([]);
  useEffect(() => {
    const loadCartDetails = async () => {
      try {
        const detailedCart = await Promise.all(
          Array.isArray(cartItems)
            ? cartItems.map(async (item) => {
                const productId = item.productId?._id || item.productId;
                if (!productId) {
                  console.warn("Skipping item with undefined productId:", item);
                  return null; // התעלם מפריטים עם productId לא מוגדר
                }
                const productDetails = await fetchProductDetails(productId);
                return {
                  ...item,
                  ...productDetails,
                };
              })
            : []
        );

        setDetailedCartItems(detailedCart.filter((item) => item !== null));
      } catch (error) {
        console.error("Error loading cart details:", error.message);
      }
    };




    if (isOpen) {
      loadCartDetails();
    }
    console.log("fetchProductDetails:",detailedCartItems)
  }, [isOpen, cartItems, fetchProductDetails]);

  const calculateTotal = () => {
    return detailedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />

      {/* Slide-over Panel */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <DialogPanel className="w-screen max-w-md transform bg-white shadow-xl transition-all">
            {/* Close Button */}
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {t("cart.title")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-200">
                <XMarkIcon className="h-6 w-6 text-gray-500" />
                <span className="sr-only">{t("cart.close")}</span>
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-6">
              {detailedCartItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {detailedCartItems.map((item) => (
                    <li key={item._id} className="py-4 flex items-center">
                      <img
                        src={item.picture}
                        alt={item.name[i18n.language]}
                        className="w-16 h-16 m-2 rounded-md object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900">
                          {item.name[i18n.language]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("cart.price")}: ₪{item.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("cart.quantity")}: {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item._id)}
                        className="text-red-600 hover:text-red-800">
                        {t("cart.remove")}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">{t("cart.empty")}</p>
              )}
            </div>

            {/* Cart Summary */}
            {detailedCartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <p>{t("cart.subtotal")}</p>
                  <p>₪{calculateTotal().toFixed(2)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("cart.shipping")}
                </p>
                <div className="mt-6">
                  <button className="w-full bg-secondaryColor text-white py-2 px-4 rounded-md shadow hover:bg-primaryColor">
                    {t("cart.checkout")}
                  </button>
                </div>
                <div className="mt-6 text-sm text-center text-gray-500">
                  <button
                    onClick={onClose}
                    className="font-medium text-primaryColor hover:text-secondaryColor">
                    {t("cart.continueShopping")} &rarr;
                  </button>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default CartModal;
