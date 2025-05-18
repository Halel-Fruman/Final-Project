import React, { useEffect, useState, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.jpg";
import FilterBar from "../../components/Category/FilterBar";
import { getActiveDiscount } from "../../utils/discountHelpers";

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [isOnSaleOnly, setIsOnSaleOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Function to shuffle an array
  // This is used to randomize the order of products displayed
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch all products from the API
  // This is done once when the component mounts
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

  // Check if there is an error and navigate to the error page
  // This is done to handle any errors that occur during the fetch
  useEffect(() => {
    if (error) navigate("/503");
  }, [error, navigate]);

  // Fetch categories from the API
  // This is done once when the component mounts
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

  // Generate store options based on the products
  // This is done to create a unique list of stores from the products
  const storeOptions = Array.from(
    new Set(
      allProducts.map((p) => {
        const name =
          p.storeName?.[i18n.language] ||
          p.storeName?.he ||
          p.storeName ||
          "Unknown";
        return JSON.stringify({ id: p.storeId, name });
      })
    )
  ).map((str) => JSON.parse(str));

  // Filter products based on selected categories, stores, and other criteria
  // This is done to display only the products that match the user's filters
  const productsToShow = allProducts.filter((product) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      product.categories?.some((catId) => selectedCategories.includes(catId));
    const storeMatch =
      selectedStores.length === 0 || selectedStores.includes(product.storeId);
    const activeDiscount = getActiveDiscount(product.discounts);
    const onSaleMatch = !isOnSaleOnly || !!activeDiscount;
    const price = product.price;
    const priceMatch =
      (!minPrice || price >= parseFloat(minPrice)) &&
      (!maxPrice || price <= parseFloat(maxPrice));
    const name = product.name?.[i18n.language]?.toLowerCase() || "";
    const searchMatch = name.includes(searchText.toLowerCase());

    return (
      categoryMatch && storeMatch && onSaleMatch && priceMatch && searchMatch
    );
  });

  // Shuffle the products to show
  // This is done to randomize the order of products displayed
  const shuffledProductsToShow = useMemo(
    () => shuffleArray(productsToShow),
    [productsToShow]
  );

  // Handle the wishlist toggle
  // This is done to add or remove products from the wishlist
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };
  // Handle the error state
  // This is done to display an error message if there is an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          {t("error")}: {error}
        </p>
      </div>
    );
  }

  //skeleton loading state
  // This is done to display a loading state while the products are being fetched
  if (isLoading) {
    return (
      <main className="px-4 py-10 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 animate-pulse shadow">
              <div className="h-48 sm:h-56 lg:h-64 bg-gray-300 rounded mb-4" />
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Render the main content of the page
  // This is done to display the main content of the page
  return (
    <div className="bg-gray-50">
      <header
        id="home"
        aria-label="Hero Section"
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
            className="mt-6 bg-white text-black py-2 px-6 rounded-full font-semibold shadow-lg hover:bg-gray-200 transition"
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
        {/* This is the filter bar component
        // It allows users to filter products by categories, stores, price range, and search text
        // This is done to provide a way for users to filter products based on their preferences*/}
        <FilterBar
          categories={categories}
          stores={storeOptions}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
          isOnSaleOnly={isOnSaleOnly}
          setIsOnSaleOnly={setIsOnSaleOnly}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {productsToShow.length === 0 ? (
          <p className="text-center text-gray-500">{t("no_products_found")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shuffledProductsToShow.map((product) => {
              const isInWishlist = wishlistLoading
                ? false
                : wishlist?.some(
                    (item) => String(item.productId) === String(product._id)
                  );


              const activeDiscount = getActiveDiscount(product.discounts);
              const isOnSale = !!activeDiscount;
              const discountPercentage = isOnSale
                ? activeDiscount.percentage || 0
                : 0;
              const discountedPrice = isOnSale
                ? product.price - product.price * (discountPercentage / 100)
                : product.price;

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

                    {isOnSale ? (
                      <div className="mt-1 text-xl font-bold">
                        <div className="flex flex-col items-center sm:flex-row sm:justify-center sm:space-x-2 rtl:space-x-reverse">
                          <span className="text-red-600 text-xl font-bold">
                            ₪{discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-700 line-through">
                            ₪{product.price.toFixed(2)}
                          </span>
                          <span className="text-green-900 text-sm font-medium">
                            {discountPercentage}%-
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-xl text-primaryColor font-bold">
                        ₪{product.price.toFixed(2)}
                      </p>
                    )}
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
