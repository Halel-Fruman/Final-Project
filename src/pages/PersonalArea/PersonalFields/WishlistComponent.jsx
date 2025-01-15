import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';

const WishlistComponent = ({ wishlist, removeFromWishlist, addToCart }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await Promise.all(
          wishlist.map(async (item) => {
            const response = await fetch(
              `http://localhost:5000/Example_products/${item.productId}`
            );
            if (!response.ok) {
              throw new Error(
                `Failed to fetch product with ID ${item.productId}`
              );
            }
            return await response.json();
          })
        );
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products for wishlist:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (wishlist?.length > 0) {
      fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [wishlist]);

  if (isLoading) {
    return <p>{t("loading")}</p>;
  }

  if (!products || products.length === 0) {
    return <p>{t("wishlist.empty")}</p>;
  }

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        {t("wishlist.title")}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {t("wishlist.subtitle", { count: products.length })}
      </p>
      <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left border-b border-gray-200">
              {t("wishlist.productName")}
            </th>
            <th className="p-4 text-left border-b border-gray-200">
              {t("wishlist.unitPrice")}
            </th>
            <th className="p-4 text-left border-b border-gray-200">
              {t("wishlist.stockStatus")}
            </th>
            <th className="p-4 text-center border-b border-gray-200">
              {t("wishlist.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="p-4 flex items-center">
                <img
                  src={product.picture || "https://placehold.co/50"}
                  alt={
                    product.name[i18n.language] || t("product.nameUnavailable")
                  }
                  className="w-12 h-12 rounded-full mr-4"
                />
                <span>{product.name[i18n.language]}</span>
              </td>
              <td className="p-4">
                {product.oldPrice && (
                  <span className="line-through text-gray-400 mr-2">
                    ₪{product.oldPrice}
                  </span>
                )}
                <span className="font-semibold text-primaryColor">
                  ₪{product.price}
                </span>
              </td>
              <td className="p-4 text-gray-700">
                {product.inStock
                  ? t("wishlist.inStock")
                  : t("wishlist.outOfStock")}
              </td>
              <td className="p-4 text-center flex justify-center items-center space-x-2">
                <button
                  onClick={() => addToCart(product._id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
                  {t("wishlist.addToCart")}
                </button>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                    <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WishlistComponent;
