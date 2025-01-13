import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { StarIcon as SolidStarIcon } from "@heroicons/react/20/solid";
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline";

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/Example_products/");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(
      (item) =>
        String(item.productId?._id || item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  if (isLoading || wishlistLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          {t("error")}: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <header className="relative bg-secondaryColor text-white">
        <h1 className="text-xxl font text-white-200">{t("welcome")}</h1>
        <p className="mt-2 text-xl text-white-300">{t("welcome_subtitle")}</p>
      </header>

      <section className="my-10 px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-6">
          {t("featured_products")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isInWishlist = wishlist.some(
              (item) =>
                String(item.productId?._id || item.productId) ===
                String(product._id)
            );

            return (
              <div
                key={product._id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
                <img
                  src={product.picture}
                  alt={product.name[i18n.language]}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.name[i18n.language]}
                  </h3>
                  <p className="text-secondaryColor text-xl font-bold mt-2">
                    ₪{product.price}
                  </p>
                  <div className="mt-4 flex justify-center space-x-4">
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-secondaryColor text-white py-2 px-4 rounded hover:bg-primaryColor transition">
                      {t("view_details")}
                    </Link>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="flex items-center justify-center">
                      {isInWishlist ? (
                        <SolidStarIcon className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <OutlineStarIcon className="h-6 w-6 text-gray-400 hover:text-yellow-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
