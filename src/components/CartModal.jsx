/**
 * @file CartModal.jsx
 * @description Modal that displays the user's shopping cart. Prices include product-level
 *              discounts and the active global promotion (if any).
 */
import { useEffect, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { updateCartItemQuantity } from "../utils/Cart";
import useGlobalPromo from "../hooks/useGlobalPromo";
import { getActiveDiscount } from "../utils/discountHelpers";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  fetchProductDetails,
  userId,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const promo = useGlobalPromo(); // ← site-wide promo

  const [detailedCartItems, setDetailedCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* load product data when modal opens */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        setDetailedCartItems([]);
        setIsLoading(false);
        return;
      }
      const data = await Promise.all(
        cartItems.map(async (item) => {
          const productId = item.productId?._id || item.productId;
          if (!productId) return null;
          const p = await fetchProductDetails(productId);
          return p ? { ...item, ...p } : null;
        })
      );
      setDetailedCartItems(data.filter(Boolean));
      setIsLoading(false);
    };
    if (isOpen) load();
  }, [isOpen, cartItems, fetchProductDetails]);

  /* subtotal with discounts */
  const calculateTotal = () => {
    return detailedCartItems.reduce((sum, item) => {
      const active = getActiveDiscount(item.discounts, promo);
      const price = active
        ? active.type === "percent"
          ? item.price * (1 - active.value / 100)
          : item.price - active.value
        : item.price;
      return sum + price * item.quantity;
    }, 0);
  };

  /* update quantity */
  const handleQuantityChange = async (productId, qty) => {
    if (qty < 1) return;
    await updateCartItemQuantity(userId, productId, qty);
    setDetailedCartItems((prev) =>
      prev.map((it) => (it._id === productId ? { ...it, quantity: qty } : it))
    );
    toast.success(t("cart.quantity_updated"));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* overlay */}
      <div className="fixed inset-0 bg-gray-800/75" />

      <div className="fixed inset-0 flex justify-start">
        <DialogPanel className="w-full max-w-md sm:max-w-lg bg-white shadow-xl flex flex-col">
          {/* header */}
          <div className="flex items-start justify-between p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              {t("cart.title")}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-200">
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* content */}
          <div className="p-4 overflow-y-auto max-h-[65vh] flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Icon
                  icon="eos-icons:loading"
                  className="w-10 h-10 animate-spin text-primaryColor"
                />
              </div>
            ) : detailedCartItems.length === 0 ? (
              <p className="text-center text-gray-500">{t("cart.empty")}</p>
            ) : (
              <ul className="divide-y">
                {detailedCartItems.map((item) => {
                  const active = getActiveDiscount(item.discounts, promo);
                  const price = active
                    ? active.type === "percent"
                      ? item.price * (1 - active.value / 100)
                      : item.price - active.value
                    : item.price;

                  const discountLabel = active
                    ? active.type === "percent"
                      ? `-${active.value}%`
                      : `-₪${active.value}`
                    : null;

                  return (
                    <li key={item._id} className="py-4 flex items-center">
                      <img
                        src={item.images?.[0] || "https://placehold.co/60"}
                        alt={item.name[i18n.language]}
                        className="w-16 h-16 m-2 rounded-md object-cover"
                      />

                      <div className="ml-4 flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.name[i18n.language]}
                        </p>

                        {active ? (
                          <div className="flex flex- items-start text-xs mt-0.5">
                            <span className="text-red-600 font-semibold">
                              ₪{price.toFixed(2)}
                            </span>
                            <span className="line-through text-gray-500">
                              ₪{item.price.toFixed(2)}
                            </span>
                            <span className="text-green-700">
                              {discountLabel}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-0.5">
                            ₪{item.price.toFixed(2)}
                          </p>
                        )}

                        {/* כמות */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                            −
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
                        className="text-red-600 hover:text-red-800 ml-3 shrink-0">
                        {t("cart.remove")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* footer */}
          {!isLoading && detailedCartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between text-lg font-medium text-gray-900">
                <span>{t("cart.subtotal")}</span>
                <span>₪{calculateTotal().toFixed(2)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{t("cart.shipping")}</p>

              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="w-full mt-6 bg-secondaryColor text-white py-2 rounded-full hover:bg-primaryColor">
                {t("cart.checkout")}
              </button>

              <div className="mt-6 text-sm text-center">
                <button
                  onClick={onClose}
                  className="font-medium text-primaryColor hover:text-secondaryColor">
                  {t("cart.continueShopping")} →
                </button>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CartModal;
