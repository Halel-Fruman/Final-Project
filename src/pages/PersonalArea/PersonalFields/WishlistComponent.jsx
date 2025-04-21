import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const WishlistComponent = ({
  wishlist,
  removeFromWishlist,
  refreshWishlist,
  addToCart,
}) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [missingCount, setMissingCount] = useState(0);

  const handleRemoveFromWishlist = useCallback(
    async (product) => {
      await removeFromWishlist(product, true);
      refreshWishlist();
    },
    [removeFromWishlist, refreshWishlist]
  );

  useEffect(() => {
    let hasCleaned = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      setMissingCount(0);
      const validProducts = [];

      for (const item of wishlist) {
        try {
          const response = await fetch(`/api/products/${item.productId}`);
          if (!response.ok) throw new Error("Not found");
          const product = await response.json();
          validProducts.push(product);
        } catch (error) {
          if (!hasCleaned) {
            handleRemoveFromWishlist({ _id: item.productId });
            hasCleaned = true;
          }
          setMissingCount((prev) => prev + 1);
        }
      }

      setProducts(validProducts);
      setIsLoading(false);
    };

    if (wishlist?.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [wishlist, handleRemoveFromWishlist]);

  if (isLoading)
    return (
      <div className="text-center py-10">
        <div className="inline-block w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">{t("wishlist.loading")}</p>
      </div>
    );
  if (!products || products.length === 0) return <p>{t("wishlist.empty")}</p>;

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        {t("wishlist.title")}
      </h2>
      <p className="text-center text-gray-600 mb-2">
        {t("wishlist.subtitle", { count: products.length })}
      </p>
      {missingCount > 0 && (
        <p className="text-center text-sm text-red-500 mb-4">
          {t("wishlist.partialLoad", { count: missingCount })}
        </p>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-center border-b">
                {t("wishlist.productName")}
              </th>
              <th className="p-4 text-center border-b">
                {t("wishlist.unitPrice")}
              </th>
              <th className="p-4 text-center border-b">
                {t("wishlist.stockStatus")}
              </th>
              <th className="p-4 text-center border-b">
                {t("wishlist.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-4 flex items-center">
                  <img
                    src={product.images?.[0] || "https://placehold.co/50"}
                    alt={
                      product.name[i18n.language] ||
                      t("product.nameUnavailable")
                    }
                    className="w-12 h-12 rounded-full ml-2"
                  />
                  <span className="text-gray-700">
                    {product.name[i18n.language]}
                  </span>
                </td>
                <td className="p-4 text-center font-bold text-primaryColor">
                  ₪{product.price}
                </td>
                <td className="p-4 text-center text-gray-700">
                  {product.stock > 0
                    ? t("wishlist.inStock")
                    : t("wishlist.outOfStock")}
                </td>
                <td className="p-4 text-center flex justify-center items-center gap-x-2">
                  <button
                    onClick={() => {
                      addToCart({ productId: product._id, quantity: 1 });
                      toast.success(t("wishlist.addToCart") + " ✅");
                    }}
                    className="bg-secondaryColor text-white p-2 rounded-full shadow-lg hover:bg-primaryColor">
                    <Icon
                      icon="material-symbols:add-shopping-cart-rounded"
                      width="24"
                      height="24"
                    />
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product)}
                    className="bg-white text-deleteC p-2 ring-1 ring-deleteC rounded-full hover:bg-deleteC hover:text-white">
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="24"
                      height="24"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded-xl p-4 flex items-center gap-x-4">
            <img
              src={product.images?.[0] || "https://placehold.co/60"}
              alt={product.name[i18n.language]}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {product.name[i18n.language]}
              </h3>
              <p className="text-sm text-gray-700">
                {t("wishlist.unitPrice")}:{" "}
                <span className="font-bold text-primaryColor">
                  ₪{product.price}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                {t("wishlist.stockStatus")}:{" "}
                {product.stock > 0
                  ? t("wishlist.inStock")
                  : t("wishlist.outOfStock")}
              </p>
              <div className="flex mt-2 space-x-2">
                <button
                  onClick={() => {
                    addToCart({ productId: product._id, quantity: 1 });
                    toast.success(t("wishlist.addToCart") + " ✅");
                  }}
                  className="bg-secondaryColor text-white p-2  rounded-full shadow-lg hover:bg-primaryColor">
                  <Icon
                    icon="material-symbols:add-shopping-cart-rounded"
                    width="20"
                    height="20"
                  />
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product)}
                  className="bg-white text-deleteC p-2 ring-1 ring-deleteC rounded-full hover:bg-deleteC hover:text-white">
                  <Icon
                    icon="material-symbols:delete-outline"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistComponent;
