import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogPanel } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateCartItemQuantity } from "../utils/Cart";
import { Icon } from "@iconify/react";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  fetchProductDetails,
  userId,
}) => {
  const { t, i18n } = useTranslation();
  const [detailedCartItems, setDetailedCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCartDetails = async () => {
      setIsLoading(true);
      try {
        const detailedCart = await Promise.all(
          Array.isArray(cartItems)
            ? cartItems.map(async (item) => {
                const productId = item.productId?._id || item.productId;
                if (!productId) return null;
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
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) loadCartDetails();
  }, [isOpen, cartItems, fetchProductDetails]);

  const calculateTotal = () => {
    return detailedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateCartItemQuantity(userId, productId, newQuantity);
      setDetailedCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success(t("cart.quantity_updated"));
    } catch (error) {
      console.error("Error updating quantity:", error.message);
      toast.error(t("cart.quantity_update_failed"));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
      aria-label={t("cart.title")}>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <DialogPanel className="w-screen max-w-md sm:max-w-lg transform bg-white shadow-xl transition-all">
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

            <div className="p-4 overflow-y-auto max-h-[65vh]">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Icon
                    icon="eos-icons:loading"
                    className="w-10 h-10 text-primaryColor animate-spin"
                  />
                </div>
              ) : detailedCartItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {detailedCartItems.map((item) => (
                    <li key={item._id} className="py-4 flex items-center">
                      <img
                        src={item.images[0]}
                        alt={item.name[i18n.language]}
                        className="w-16 h-16 m-2 rounded-md object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {item.name[i18n.language]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("cart.price")}: ₪{item.price}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                            -
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onRemoveFromCart(item._id);
                          toast.success(t("cart.removed"));
                        }}
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

            {!isLoading && detailedCartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <p>{t("cart.subtotal")}</p>
                  <p>₪{calculateTotal().toFixed(2)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("cart.shipping")}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/checkout");
                    }}
                    className="w-full bg-secondaryColor text-white py-2 px-4 rounded-full shadow hover:bg-primaryColor">
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
