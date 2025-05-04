// File: src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

const ProductPage = ({ addToWishlist, wishlist, addToCart }) => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [userAlreadyRated, setUserAlreadyRated] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
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
        setUserAlreadyRated(data.userHasRated || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  useEffect(() => {
    if (error) {
      navigate("/503");
    }
  }, [error, navigate]);

  const toggleWishlist = () => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  const handleAddToCart = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error(t("cart.mustBeLoggedIn")); // הוסף תרגום מתאים
      return;
    }

    addToCart({ productId: product._id, quantity: 1 });
    toast.success(t("wishlist.addToCart") + " ✅");
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleRating = async (newRating) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "You have already rated this product.") {
          toast.error(t("product.alreadyRated")); // תרגם את זה בקובץ השפה
        } else {
          toast.error(t("product.ratingError"));
        }
        return;
      }

      setProduct(data.product);
      setRating(newRating);
      toast.success(t("product.ratingSuccess")); // אפשרות לתגובה חיובית
    } catch (err) {
      console.error("Error updating rating:", err.message);
      toast.error(t("product.ratingError"));
    }
  };

  if (isLoading) {
    return (
      <main className="bg-gray-50">
        <div className="container mx-auto py-12 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="h-[400px] w-[350px] bg-gray-200 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 lg:flex-grow w-full lg:min-h-128">
              <div className="h-8 bg-gray-200 rounded mb-4 w-2/3" />
              <div className="flex items-center gap-4 mb-4">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-300 rounded" />
                <div className="h-5 w-10 bg-gray-100 rounded" />
              </div>
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-5 w-5 bg-gray-200 rounded-full" />
                ))}
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="h-5 bg-gray-200 w-32 mb-2 rounded" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-3 bg-gray-100 rounded w-3/4" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-md" />
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="h-5 bg-gray-200 w-40 mb-2 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
              <div className="flex gap-4 mt-6">
                <div className="h-12 w-1/2 bg-gray-300 rounded-lg" />
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
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
          <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center items-center bg-white rounded-lg shadow-lg min-h-128">
            <img
              src={selectedImage || "https://placehold.co/300"}
              alt={productName}
              className="object-contain max-h-128 max-w-full rounded-md border"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 lg:flex-grow relative w-full lg:min-h-128">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productName}
            </h1>

            <div className="mb-2 flex items-center gap-4">
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

            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${
                    i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
                  } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() => {
                    if (isLoggedIn) {
                      handleRating(i + 1);
                    } else {
                      toast.error(t("login.requiredToRate"));
                    }
                  }}
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({product.totalReviews || 0} {t("product.reviews")})
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 ">
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
              <div className="flex justify-end mb-4 flex-wrap gap-2 mr-auto">
                {product.images.map((image, index) => (
                  <img
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.details")}
              </h3>
              <p className="text-gray-700">{productDetails}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                className="lg:w-1/2 bg-primaryColor text-white py-2 px-4 rounded-lg text-xl font-bold hover:bg-primaryColor transition">
                {t("product.addToCart")}
              </button>
              <button
                onClick={toggleWishlist}
                className="self-center bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
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
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
