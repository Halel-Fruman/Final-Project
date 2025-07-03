/**
 * @file HomePage.jsx
 * @description This file contains the HomePage component which displays a list of products,
 * allows filtering by categories, stores, price range, and stock status,
 * and includes a hero section with a background image and welcome message.
 */

import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.webp";
import FilterBar from "../../components/Category/FilterBar";
import { getActiveDiscount } from "../../utils/discountHelpers";

/**
 * @component ProductImage
 * @description Renders the product image, falling back to the original image if WebP is not available.
 * @param {Object} product - The product object containing image URLs.
 */
const ProductImage = ({ product, i18n }) => {
  const [useFallback, setUseFallback] = useState(false);
  // Get the first image from the product's images array
  const originalImage = product.images?.[0];
  // Try to build a corresponding .webp URL
  const webpImage = originalImage
    ? originalImage.replace(/\.(jpg|jpeg|png)$/i, ".webp")
    : null;
  // Determine which image to show based on availability and fallback state
  // If useFallback is true or webpImage is not available, show the original image
  const imageToShow = useFallback || !webpImage ? originalImage : webpImage;

  return (
    <div className="aspect-[83/96] w-full overflow-hidden">
      <img
        src={imageToShow || "https://placehold.co/300x400?text=No+Image"}
        onError={() => setUseFallback(true)} /* fallback to original image */
        alt={product.name?.[i18n.language] || "Product"}
        className="object-cover w-full h-full"
        loading="lazy" /* lazy load the image */
      />
    </div>
  );
};

/** * @component HomePage
 * @description Main component for the home page, displaying products with filtering options,
 * a hero section, and pagination.
 * @param {Function} addToWishlist - Function to add or remove products from the wishlist.
 * @param {Array} wishlist - Array of products in the wishlist.
 * @param {boolean} wishlistLoading - Flag indicating if the wishlist is currently loading.
 * @returns {JSX.Element} The rendered HomePage component.
 */
const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  // State management for products, categories, filters, and loading states
  // Using useState to manage local state for products, categories, and filters
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // Using sessionStorage to persist filter states across page reloads
  // This allows users to maintain their filter selections even if they navigate away and return later
  const [selectedCategories, setSelectedCategories] = useState(() =>
    JSON.parse(sessionStorage.getItem("selectedCategories") || "[]")
  );
  const [selectedStores, setSelectedStores] = useState(() =>
    JSON.parse(sessionStorage.getItem("selectedStores") || "[]")
  );
  const [isOnSaleOnly, setIsOnSaleOnly] = useState(
    sessionStorage.getItem("isOnSaleOnly") === "true"
  );
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Persist filters to session storage
  useEffect(() => {
    sessionStorage.setItem(
      "selectedCategories",
      JSON.stringify(selectedCategories)
    );
    sessionStorage.setItem("selectedStores", JSON.stringify(selectedStores));
    sessionStorage.setItem("isOnSaleOnly", isOnSaleOnly);
    sessionStorage.setItem("minPrice", minPrice);
    sessionStorage.setItem("maxPrice", maxPrice);
    sessionStorage.setItem("searchText", searchText);
    sessionStorage.setItem("inStockOnly", inStockOnly);
  }, [
    selectedCategories,
    selectedStores,
    isOnSaleOnly,
    minPrice,
    maxPrice,
    searchText,
    inStockOnly,
  ]);

  // Fetch all products from the API
  // This effect runs once when the component mounts to load products
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

  // Handle error by navigating to a 503 error page if an error occurs
  // This effect runs whenever the error state changes
  useEffect(() => {
    if (error) navigate("/503");
  }, [error, navigate]);

  // Fetch categories from the API
  // This effect runs once when the component mounts to load categories
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

  // Restore scroll position from session storage when the component mounts
  // This effect runs whenever the isLoading state changes
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo({
        top: parseInt(scrollPosition, 10),
        behavior: "instant",
      });
      sessionStorage.removeItem("scrollPosition");
    }
  }, [isLoading]);

  // Generate store options from all products
  // This uses useMemo to optimize performance by memoizing the store options
  const storeOptions = useMemo(() => {
    return Array.from(
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
  }, [allProducts, i18n.language]);

  // Filter products based on selected categories, stores, price range, search text, and stock status
  // This uses useMemo to optimize performance by memoizing the filtered products
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

  // Sort products by ID using useMemo to optimize performance
  // This ensures that the products are always sorted consistently
  const sortedProductsToShow = useMemo(() => {
    return [...productsToShow].sort((a, b) =>
      String(a._id).localeCompare(String(b._id))
    );
  }, [productsToShow]);

  // Calculate pagination details
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProductsToShow.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProductsToShow.length / productsPerPage);

  // Handle page change and scroll to top
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle product click to navigate to product details page
  // This function saves the current scroll position to session storage
  const handleProductClick = (product) => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/products/${product._id}`);
  };
  // Toggle wishlist status for a product
  // This function checks if the product is already in the wishlist and adds/removes it accordingly
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  // If the wishlist is loading, show a loading state
  // This provides a better user experience by indicating that data is being fetched
  if (isLoading)
    return (
      <div className="bg-primaryColor bg-opacity-10">
        <header className="relative h-[700px] overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black opacity-50 mix-blend-multiply" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="h-12 w-2/3 sm:w-1/2 bg-gray-300 rounded mb-4 animate-pulse" />
            <div className="h-8 w-1/2 sm:w-1/3 bg-gray-300 rounded mb-6 animate-pulse" />
            <div className="h-10 w-32 bg-white rounded-full animate-pulse" />
          </div>
        </header>
        <main className="px-4 py-10 sm:px-6 lg:px-12">
          <div className="h-8 w-48 mx-auto mb-8 bg-gray-300 rounded animate-pulse" />
          <div className="mb-10 h-16 bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="relative bg-white rounded-lg p-4 shadow animate-pulse">
                <div className="absolute top-2 right-2 w-10 h-10 bg-gray-200 rounded-full" />
                <div className="aspect-[83/96] bg-gray-300 rounded mb-4" />
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );

  // Render the HomePage component
  // This includes the hero section, filter bar, product grid, and pagination controls
  return (
    <div className="bg-primaryColor bg-opacity-10">
      {/* Hero Section */}
      <header className="relative h-[0px] overflow-hidden">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black opacity-50 mix-blend-multiply" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8.5xl font-bold text-secondaryColor">
            {t("welcome")}
          </h1>
          <p
            className="mt-4 text-xl sm:text-2xl md:text-5xl text-secondaryColor"
            dangerouslySetInnerHTML={{ __html: t("welcome_subtitle") }}
          />
          <button
            className="mt-6 bg-white text-black py-2 px-6 rounded-full font-semibold shadow-lg hover:bg-gray-200 transition transition-transform duration-200 transform hover:scale-110"
            onClick={() =>
              document
                .getElementById("products-section")
                .scrollIntoView({ behavior: "smooth" })
            }>
            {t("view_products")}
          </button>
        </div>
      </header>

      <main id="products-section" className="py-10 px-4 sm:px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-8">
          {t("featured_products")}
        </h2>

        {/* Filter Bar
            This component allows users to filter products by
            categories, stores, price range, search text, and stock status.
            It also allows toggling the "on sale" filter and displays the current filter selections. */}
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {currentProducts.map((product) => {
            const isInWishlist = wishlist?.some(
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
                <article className="relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition transition-transform duration-200 transform hover:scale-105">
                  <div className="absolute top-2 right-2 z-10 w-10 h-10 ">
                    <button
                      onClick={() => toggleWishlist(product)}
                      title={
                        isInWishlist
                          ? t("remove_from_wishlist")
                          : t("add_to_wishlist")
                      }
                      className="w-full h-full bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-transform duration-200 transform hover:scale-110">
                      {/* Conditional rendering of heart icon based on wishlist status */}
                      {isInWishlist ? (
                        <SolidHeartIcon className="h-6 w-6 text-primaryColor" />
                      ) : (
                        <OutlineHeartIcon className="h-6 w-6 text-secondaryColor hover:text-primaryColor" />
                      )}
                    </button>
                  </div>
                  <div
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer">
                    <ProductImage product={product} i18n={i18n} />
                  </div>
                </article>
                <div className="p-4 text-center">
                  <h3 className="text-base text-xl text-gray-900 line-clamp-2 min-h-[3.6rem]">
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
                          {discountPercentage}%
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

        {/* Paging Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              className="px-4 py-2 bg-primaryColor rounded-full hover:secondaryColor text-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}>
              {i18n.language === "he" ? "הקודם" : "Previous"}
            </button>
            <span>
              {t("page")} {currentPage} {t("of")} {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-primaryColor rounded-full hover:secondaryColor text-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}>
              {i18n.language === "he" ? "הבא" : "Next"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
