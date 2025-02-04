import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

// The WishlistComponent is a functional component that takes the wishlist, removeFromWishlist, refreshWishlist, and addToCart as props.
const WishlistComponent = ({
  wishlist,
  removeFromWishlist,
  refreshWishlist,
  addToCart,
}) => {
  const { t, i18n } = useTranslation(); // useTranslation hook to access the i18n instance and the translation function t
  const [products, setProducts] = useState([]); // useState hook to store the products in the wishlist
  const [isLoading, setIsLoading] = useState(true); // useState hook to store the loading state

  // useEffect hook to fetch the products in the wishlist when the wishlist changes
  useEffect(() => {
    const fetchProducts = async () => {
      // Use Promise.all to fetch all products in the wishlist
      try {
        const fetchedProducts = await Promise.all(
          wishlist.map(async (item) => {
            const response = await fetch(
              `http://localhost:5000/products/${item.productId}`
            );
            // if the response is not ok, throw an error
            if (!response.ok) {
              throw new Error(
                `Failed to fetch product with ID ${item.productId}`
              );
            }
            // return the product data
            return await response.json();
          })
        );
        setProducts(fetchedProducts); // set the fetched products in the state
      } catch (error) {
        console.error("Error fetching products for wishlist:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    // if the wishlist is not empty, fetch the products
    if (wishlist?.length > 0) {
      fetchProducts();
    } else {
      setProducts([]); // set the products to an empty array
      setIsLoading(false); // set the loading state to false
    }
  }, [wishlist]);

  // handleRemoveFromWishlist function to remove a product from the wishlist
  const handleRemoveFromWishlist = async (product) => {
    await removeFromWishlist(product, true); // remove the product from the wishlist
    console.log("product._id1", product._id);
    refreshWishlist(); // refresh the wishlist
  };
  // if the products are loading, display a loading message
  if (isLoading) {
    return <p>{t("loading")}</p>;
  }
  // if there are no products in the wishlist, display an empty message
  if (!products || products.length === 0) {
    return <p>{t("wishlist.empty")}</p>;
  }

  // return the wishlist table with the products
  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        {t("wishlist.title")}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {t("wishlist.subtitle", { count: products.length })}
      </p>
      <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-center border-b border-gray-200">
              {t("wishlist.productName")}
            </th>
            <th className="p-4 text-center border-b border-gray-200">
              {t("wishlist.unitPrice")}
            </th>
            <th className="p-4 text-center border-b border-gray-200">
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
              <td className="p-4 flex items-center ">
                <img
                  src={product.images[0] || "https://placehold.co/50"}
                  alt={
                    product.name[i18n.language] || t("product.nameUnavailable")
                  }
                  className="w-12 h-12 rounded-full ml-2"
                />
                <span className="text-gray-700">
                  {product.name[i18n.language]}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className="font-semibold text-primaryColor">
                  ₪{product.price}
                </span>
              </td>
              <td className="p-4 text-center text-gray-700">
                {product.inStock
                  ? t("wishlist.inStock")
                  : t("wishlist.outOfStock")}
              </td>
              <td className="p-4 text-center flex justify-center items-center space-x-2">
                <button
                  onClick={() => addToCart(product)}
                  className="bg-secondaryColor text-gray-100 py-2 px-2 ml-2 rounded-full shadow-lg hover:bg-primaryColor transition">
                  <Icon
                    icon="material-symbols:add-shopping-cart-rounded"
                    width="24"
                    height="24"
                  />{" "}
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product)}
                  className="bg-white text-deleteC p-2 ring-1 ring-deleteC rounded-full hover:bg-deleteC transition hover:text-white">
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
  );
};

export default WishlistComponent;
