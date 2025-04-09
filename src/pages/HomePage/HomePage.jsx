import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.jpg";
import FilterBar from "../../components/Category/FilterBar";

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/Products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setAllProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/Category/");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const storeOptions = Array.from(
    new Set(
      allProducts.map((p) =>
        JSON.stringify({ id: p.storeId, name: p.storeName })
      )
    )
  ).map((str) => JSON.parse(str));

  const productsToShow = allProducts.filter((product) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      product.categories?.some((catId) => selectedCategories.includes(catId));
    const storeMatch =
      selectedStores.length === 0 || selectedStores.includes(product.storeId);
    return categoryMatch && storeMatch;
  });

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
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
              document
                .getElementById("products-section")
                .scrollIntoView({ behavior: "smooth" });
            }}>
            {t("view_products")}
          </button>
        </div>
      </header>

      <main id="products-section" className="py-10 px-4 sm:px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-8">
          {t("featured_products")}
        </h2>

        <FilterBar
          categories={categories}
          stores={storeOptions}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
        />

        {productsToShow.length === 0 ? (
          <p className="text-center text-gray-500">{t("no_products_found")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {productsToShow.map((product) => {
              const isInWishlist = wishlistLoading
                ? false
                : wishlist?.some(
                    (item) => String(item.productId) === String(product._id)
                  );

              return (
                <div key={product._id} className="flex flex-col">
                  <article className="relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
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

                  <div className="p-4 text-center">
                    <h3 className="text-base text-xl text-gray-900">
                      {product.name[i18n.language]}
                    </h3>
                    <p className="mt-1 text-xl text-primaryColor font-bold">
                      ₪{product.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
