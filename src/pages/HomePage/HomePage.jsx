// HomePage.jsx - Full version with CLS optimizations applied
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import backgroundImage from "../../backgroung.webp";
import FilterBar from "../../components/Category/FilterBar";
import { getActiveDiscount } from "../../utils/discountHelpers";

// ProductImage component to handle image loading and fallback
const ProductImage = ({ product, i18n }) => {
  const [useFallback, setUseFallback] = useState(false);
  const originalImage = product.images[0];
  const webpImage = originalImage.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  return (
    <div className="aspect-[83/96] w-full overflow-hidden">
      <img
        src={useFallback ? originalImage : webpImage}
        onError={() => setUseFallback(true)}
        alt={product.name[i18n.language]}
        className="object-cover w-full h-full"
        loading="lazy"
      />
    </div>
  );
};

// HomePage component
// This component fetches products, categories, and handles filtering

const HomePage = ({ addToWishlist, wishlist, wishlistLoading }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

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

  // Save filter state to sessionStorage whenever it changes
  // This allows the filters to persist across page reloads
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

  // Fetch products from the API
  // This effect runs once when the component mounts
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

  // Handle error by navigating to a 503 page if an error occurs
  // This effect runs whenever the error state changes
  useEffect(() => {
    if (error) navigate("/503");
  }, [error, navigate]);

  // Fetch categories from the API
  // This effect runs once when the component mounts
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

  // Restore scroll position from sessionStorage when the component mounts
  // This effect runs whenever the isLoading state changes
  // This ensures that the scroll position is restored after the products are loaded
  // This is useful for maintaining user experience when navigating back to the homepage
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

  // Generate store options for the filter bar
  // This uses a Set to ensure unique store options based on storeId and name

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

  // Filter products based on selected categories, stores, sale status, price range, search text, and stock status
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

  // Sort products by ID in reverse order
  // This uses a custom sorting function to reverse the string representation of the product ID

  const sortedProductsToShow = useMemo(() => {
    return [...productsToShow].sort((a, b) =>
      String(a._id)
        .split("")
        .reverse()
        .join("")
        .localeCompare(String(b._id).split("").reverse().join(""))
    );
  }, [productsToShow]);

  // Toggle wishlist status for a product
  // This checks if the product is already in the wishlist and calls addToWishlist accordingly
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  // Handle product click to navigate to the product details page
  // This saves the current scroll position to sessionStorage before navigating
  // This is useful for maintaining user experience when navigating back to the homepage
  // This allows the user to return to the same scroll position after viewing a product
  const handleProductClick = (product) => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/products/${product._id}`);
  };

  // show loading state if isLoading is true
  // This displays a skeleton loading state while the products are being fetched
  if (isLoading) {
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
            {Array.from({ length: 10 }).map((_, index) => (
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
  }

  // Render the homepage with products and filters
  // This includes the header with a background image, a welcome message, and a button to view products
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8.5xl font-bold text-secondaryColor">
            {t("welcome")}
          </h1>
          <p
            className="mt-4 text-xl sm:text-2xl md:text-5xl text-secondaryColor"
            dangerouslySetInnerHTML={{ __html: t("welcome_subtitle") }}></p>
          <button
            className="mt-6 bg-white text-black py-2 px-6 rounded-full font-semibold shadow-lg hover:bg-gray-200 transition"
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
        <div className="mb-10">
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
        </div>
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
                    <div className="absolute top-2 right-2 z-10 w-10 h-10">
                      {!wishlistLoading && (
                        <button
                          onClick={() => toggleWishlist(product)}
                          title={
                            isInWishlist
                              ? t("remove_from_wishlist")
                              : t("add_to_wishlist")
                          }
                          className="w-full h-full bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                          {isInWishlist ? (
                            <SolidHeartIcon className="h-6 w-6 text-primaryColor" />
                          ) : (
                            <OutlineHeartIcon className="h-6 w-6 text-secondaryColor hover:text-primaryColor" />
                          )}
                        </button>
                      )}
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
        )}
      </main>
    </div>
  );
};

export default HomePage;
