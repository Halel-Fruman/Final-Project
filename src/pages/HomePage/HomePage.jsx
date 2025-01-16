import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.jpg";

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // טעינת המוצרים
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
    const isInWishlist = wishlist?.some(
      (item) =>
        String(item.productId?._id || item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  // במקרה של שגיאה
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          {t("error")}: {error}
        </p>
      </div>
    );
  }

  // הצגת מסך הטעינה רק כאשר המוצרים עצמם נטענים
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-backGC">
      {/* Header */}
      <section
        className="relative bg-primaryColor text-white"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "700px",
        }}>
        {/* שכבת Overlay */}
        <div
          className="absolute inset-0 bg-black opacity-40"
          style={{ mixBlendMode: "multiply" }}></div>

        {/* תוכן הכותרת */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 id="welcome" className="text-8.5xl font-bold text-secondaryColor">
            {t("welcome")}
          </h1>
          <p
            id="welcome-subtitle"
            className="mt-2 text-5xl text-secondaryColor"
            dangerouslySetInnerHTML={{ __html: t("welcome_subtitle") }}></p>

          {/* כפתור גלילה */}
          <button
            className="mt-6 bg-white text-black py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition"
            onClick={() => {
              document.getElementById("products-section").scrollIntoView({
                behavior: "smooth",
              });
            }}>
            {t("view_products")}
          </button>
        </div>
      </section>

      {/* Products Section */}
      <main id="products-section" className="my-10 px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-6">
          {t("featured_products")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => {
            const isInWishlist = wishlistLoading
              ? false
              : wishlist?.some(
                  (item) =>
                    String(item.productId?._id || item.productId) ===
                    String(product._id)
                );

            return (
              <div>
                <article
                  key={product._id}
                  className="relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                  {/* כפתור Wishlist */}
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

                  {/* תמונה */}
                  <Link to={`/product/${product._id}`}>
                    <div className="aspect-w-1 aspect-h-1 rounded-lg">
                      <img
                        src={product.picture}
                        alt={product.name[i18n.language]}
                        className="object-cover w-full h-72"
                      />
                    </div>
                  </Link>
                </article>
                {/* פרטים */}
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900">
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
