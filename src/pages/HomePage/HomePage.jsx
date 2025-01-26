import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.jpg";

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [allProducts, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/Products/");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json(); // המידע מכיל את כל המוצרים מכל החנויות
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
    const isInWishlist = wishlist?.some(
      (item) =>
        String( item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          {t("error")}: {error}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <header
        className="relative bg-primaryColor text-white"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "700px",
        }}>
        <div
          className="absolute inset-0 bg-black opacity-50"
          style={{ mixBlendMode: "multiply" }}></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8.5xl font-bold text-secondaryColor">
            {t("welcome")}
          </h1>
          <p
            className="mt-4 text-xl sm:text-2xl md:text-5xl text-secondaryColor"
            dangerouslySetInnerHTML={{ __html: t("welcome_subtitle") }}></p>
          <button
            className="mt-6 bg-white text-black py-2 px-6 rounded-lg font-semibold shadow-lg hover:bg-gray-200 transition"
            onClick={() => {
              document.getElementById("products-section").scrollIntoView({
                behavior: "smooth",
              });
            }}>
            {t("view_products")}
          </button>
        </div>
      </header>

      {/* Products Section */}
      <main id="products-section" className="py-10 px-4 sm:px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-8">
          {t("featured_products")}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allProducts.map((product) => {
            const isInWishlist = wishlistLoading
              ? false
              : wishlist?.some(
                  (item) =>
                    String(item.productId) ===
                    String(product._id)
                );

            return (
              <div key={product._id} className="flex flex-col">
                <article className="relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    title={
                      isInWishlist
                        ? t("remove_from_wishlist")
                        : t("add_to_wishlist")
                    }
                    className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                    {isInWishlist ? (
                      <SolidHeartIcon className="h-6 w-6 text-primaryColor" />
                    ) : (
                      <OutlineHeartIcon className="h-6 w-6 text-secondaryColor hover:text-primaryColor" />
                    )}
                  </button>

                  {/* Product Image */}
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-w-1 aspect-h-1 rounded-lg">
                      <img
                        src={product.images[0]}
                        alt={product.name[i18n.language]}
                        className="object-cover w-full h-56 sm:h-64 lg:h-72"
                      />
                    </div>
                  </Link>
                </article>

                {/* Product Details */}
                <div className="p-4 text-center">
                  <h3 className="text-base font-medium text-gray-900">
                    {product.name[i18n.language]}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">₪{product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
