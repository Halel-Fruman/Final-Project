import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.jpg";
import FilterBar from "../../components/Category/FilterBar";
import { getActiveDiscount } from "../../utils/discountHelpers";

// This component renders the home page with a hero section, product listings, and filters.
const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() =>
    JSON.parse(sessionStorage.getItem("selectedCategories") || "[]")
  );
  const [selectedStores, setSelectedStores] = useState(() =>
    JSON.parse(sessionStorage.getItem("selectedStores") || "[]")
  );
  const [isOnSaleOnly, setIsOnSaleOnly] = useState(
    sessionStorage.getItem("isOnSaleOnly") === "true"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState(
    sessionStorage.getItem("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    sessionStorage.getItem("maxPrice") || ""
  );
  const [searchText, setSearchText] = useState(
    sessionStorage.getItem("searchText") || ""
  );
  const [inStockOnly, setInStockOnly] = useState(
    sessionStorage.getItem("inStockOnly") === "true"
  );

  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.setItem("inStockOnly", inStockOnly);
  }, [inStockOnly]);

  useEffect(() => {
    sessionStorage.setItem(
      "selectedCategories",
      JSON.stringify(selectedCategories)
    );
  }, [selectedCategories]);

  useEffect(() => {
    sessionStorage.setItem("selectedStores", JSON.stringify(selectedStores));
  }, [selectedStores]);

  useEffect(() => {
    sessionStorage.setItem("searchText", searchText);
  }, [searchText]);

  useEffect(() => {
    sessionStorage.setItem("minPrice", minPrice);
  }, [minPrice]);

  useEffect(() => {
    sessionStorage.setItem("maxPrice", maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    sessionStorage.setItem("isOnSaleOnly", isOnSaleOnly);
  }, [isOnSaleOnly]);

  // Fetch all products and handle loading/error states
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

  // Fetch categories for the filter bar
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

  // Restore scroll position after loading products
  // This is useful for maintaining user experience when navigating back to the home page
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo({
        top: parseInt(scrollPosition, 10),
        behavior: "instant",
      });
      // sessionStorage.removeItem("scrollPosition");
    }
  }, [isLoading]);

  // Generate store options for the filter bar
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
    const stockMatch =
      !inStockOnly || product.stock > 0 || product.allowBackorder;

    return (
      categoryMatch &&
      storeMatch &&
      onSaleMatch &&
      priceMatch &&
      searchMatch &&
      stockMatch
    );
  });

  const sortedProductsToShow = useMemo(() => {
    return [...productsToShow].sort((a, b) =>
      String(a._id)
        .split("")
        .reverse()
        .join("")
        .localeCompare(String(b._id).split("").reverse().join(""))
    );
  }, [productsToShow]);
  // Function to toggle wishlist status for a product
  // This function checks if the product is already in the wishlist and adds/removes it accordingly
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  // Function to handle product click, which navigates to the product details page
  // It also saves the current scroll position to sessionStorage for later restoration
  const handleProductClick = (product) => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/products/${product._id}`);
  };

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          {t("error")}: {error}
        </p>
      </div>
    );
  }
  // Handle loading state
  // This displays a loading skeleton while products are being fetched
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
  // Render the home page with hero section, product listings, and filter bar

  return (
    <div className="bg-primaryColor bg-opacity-10">
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
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
        />

        {productsToShow.length === 0 ? (
          <p className="text-center text-gray-500">{t("no_products_found")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedProductsToShow.map((product) => {
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

                    <div
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer aspect-w-1 aspect-h-1 rounded-lg">
                      <img
                        src={product.images[0]}
                        alt={product.name[i18n.language]}
                        className="object-cover w-full h-56 sm:h-64 lg:h-72"
                      />
                    </div>
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
