// ProductPage.jsx – LCP Optimized Version without react-helmet
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [useFallback, setUseFallback] = useState(false);
  const webpSrc = src?.replace(/\.(jpg|jpeg|png)$/i, ".webp") || src;

  return (
    <img
      src={useFallback ? src : webpSrc}
      onError={() => setUseFallback(true)}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

const ProductPage = ({ addToWishlist, wishlist, addToCart }) => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [about, setAbout] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const fetchProduct = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`/api/Products/${id}`, {
          method: "GET",
          headers,
        });
        if (!response.ok) throw new Error(t("error.fetchProduct"));
        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.images[0]);
        setRating(data.averageRating || 0);
        setAbout(data.storeAbout?.[i18n.language] || data.storeAbout?.he || "");

        // ✅ preload image dynamically
        const preload = document.createElement("link");
        preload.rel = "preload";
        preload.as = "image";
        preload.href = data.images[0]?.replace(/\.(jpg|jpeg|png)$/i, ".webp");
        document.head.appendChild(preload);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, t, i18n.language]);

  useEffect(() => {
    if (error) navigate("/503");
  }, [error, navigate]);

  const toggleWishlist = () => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  const handleAddToCart = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error(t("cart.mustBeLoggedIn"));
    addToCart({ productId: product._id, quantity: 1 });
    toast.success(t("wishlist.addToCart") + " ✅");
  };

  const handleImageClick = (image) => setSelectedImage(image);

  const handleRating = async (newRating) => {
    try {
      const response = await fetchWithTokenRefresh(`/api/products/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.message === "You have already rated this product.") {
          toast.error(t("product.alreadyRated"));
        } else {
          toast.error(t("product.ratingError"));
        }
        return;
      }
      setProduct(data.product);
      setRating(newRating);
      toast.success(t("product.ratingSuccess"));
    } catch (err) {
      toast.error(t("product.ratingError"));
    }
  };

  if (isLoading) {
    return (
      <main className="bg-gray-50">
        <div className="container mx-auto py-12 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Skeleton for image + thumbnails */}
            <div className="flex-shrink-0 w-full lg:w-1/2 flex flex-col justify-center items-center bg-white rounded-lg shadow-lg min-h-128">
              <div className="w-full max-w-lg aspect-[4/3] bg-gray-200 rounded-md mb-4" />
              <div className="flex flex-wrap gap-2 min-h-[88px]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-300 rounded-md" />
                ))}
              </div>
            </div>

            {/* Skeleton for content */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:flex-grow w-full lg:min-h-128">
              <div className="h-9 bg-gray-300 w-3/4 mb-4 rounded" />{" "}
              {/* Title */}
              <div className="flex items-center gap-4 mb-4 min-h-[2.5rem]">
                <div className="w-24 h-6 bg-gray-200 rounded" /> {/* Price */}
                <div className="w-16 h-5 bg-gray-300 rounded" />
                <div className="w-12 h-5 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center mb-4 min-h-[2rem] gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-gray-200 rounded-full" />
                ))}
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="mb-6">
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-3 bg-gray-100 rounded w-3/4" />
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
              <div className="flex gap-4 mt-6">
                <div className="h-12 w-1/2 bg-gray-300 rounded-full" />
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
              </div>
              <div className="my-6">
                <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return <div>{t("product.notFound")}</div>;

  const language = i18n.language;
  const productName = product.name[language] || product.name["en"];
  const productDetails =
    product.description[language] || product.description["en"];
  const productHighlights =
    product.highlight[language] || product.highlight["en"] || [];
  const productPrice = product.price || 0;
  const isInWishlist = wishlist?.find(
    (item) => String(item.productId) === String(product._id)
  );
  const currentDate = new Date();
  const activeDiscount = product.discounts?.find((discount) => {
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return start <= currentDate && currentDate <= end;
  });
  const isOnSale = !!activeDiscount;
  const discountPercentage = isOnSale ? activeDiscount.percentage || 0 : 0;
  const discountedPrice = isOnSale
    ? productPrice - productPrice * (discountPercentage / 100)
    : productPrice;

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-shrink-0 w-full lg:w-1/2 flex flex-col justify-center items-center bg-white rounded-lg shadow-lg min-h-128">
            <div className="w-full max-w-lg aspect-[4/3]">
              <ImageWithFallback
                src={selectedImage || "https://placehold.co/300"}
                alt={productName}
                className="object-cover w-full h-full rounded-md border"
              />
            </div>
            <div className="flex m-4 flex-wrap gap-2 min-h-[88px]">
              {product.images.map((image, index) => (
                <ImageWithFallback
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleImageClick(image)}
                  className={`h-20 w-20 object-cover rounded-lg cursor-pointer border ${
                    selectedImage === image
                      ? "border-4 border-primaryColor"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 lg:flex-grow relative w-full lg:min-h-128">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 min-h-[3.6rem] line-clamp-2">
              {productName}
            </h1>

            {product.stock <= 0 && !product.allowBackorder && (
              <span className=" right-6 bg-red-600 text-white  px-4 py-1 rounded-full text-sm font-semibold shadow">
                {t("product.outOfStock")}
              </span>
            )}

            <div className="mb-2 flex items-center gap-4 min-h-[2.5rem]">
              {isOnSale ? (
                <>
                  <span className="text-2xl text-red-600 font-bold">
                    ₪{discountedPrice.toFixed(2)}
                  </span>
                  <span className="line-through text-gray-700 text-lg">
                    ₪{productPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-green-800 font-semibold">
                    -{discountPercentage}%
                  </span>
                </>
              ) : (
                <p className="text-xl text-primaryColor font-bold">
                  ₪{productPrice}
                </p>
              )}
            </div>

            <div className="flex items-center mb-4 min-h-[2rem]">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${
                    i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
                  } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() =>
                    isLoggedIn
                      ? handleRating(i + 1)
                      : toast.error(t("login.requiredToRate"))
                  }
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({product.totalReviews || 0} {t("product.reviews")})
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.highlights")}
              </h2>
              <ul className="list-disc pl-5 text-gray-700">
                {productHighlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.details")}
              </h3>
              <p className="text-gray-700">{productDetails}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`lg:w-1/2 py-2 px-4 rounded-full text-xl font-bold transition ${
                  product.stock <= 0 && !product.allowBackorder
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primaryColor text-white hover:bg-primaryColor"
                }`}>
                {product.stock <= 0 && !product.allowBackorder
                  ? t("product.outOfStock")
                  : t("product.addToCart")}
              </button>

              <div className="w-12 h-12">
                <button
                  onClick={toggleWishlist}
                  className="w-full h-full bg-white p-3 rounded-full ring-1 ring-secondaryColor shadow-lg hover:bg-gray-100 transition"
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }>
                  {isInWishlist ? (
                    <SolidHeartIcon className="h-6 w-6 text-primaryColor" />
                  ) : (
                    <OutlineHeartIcon className="h-6 w-6 text-secondaryColor hover:text-primaryColor" />
                  )}
                </button>
              </div>
            </div>

            <div className="my-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.about")}
              </h3>
              <p className="text-gray-700">{about}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
