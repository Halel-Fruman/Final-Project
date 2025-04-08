// File: ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

const ProductPage = ({ addToWishlist, wishlist, addToCart }) => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/Products/${id}`);
        if (!response.ok) throw new Error(t("error.fetchProduct"));
        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.images[0]);
        setRating(data.averageRating || 0);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  const toggleWishlist = () => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    addToWishlist(product, isInWishlist);
  };

  const handleAddToCart = () => {
    addToCart({ productId: product._id, quantity: 1 });
    toast.success(t("wishlist.addToCart") + " ✅");
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleRating = async (newRating) => {
    try {
      const response = await fetch(
        `/api/products/${id}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: newRating }),
        }
      );
      if (!response.ok) throw new Error("Failed to update rating");
      const updatedProduct = await response.json();
      setProduct(updatedProduct.product);
      setRating(newRating);
    } catch (err) {
      console.error("Error updating rating:", err.message);
    }
  };

  if (isLoading)
    return <div className="flex justify-center p-10">{t("loading")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
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
  const isOnSale = product.discounts?.length > 0;
  const discountPercentage = isOnSale
    ? product.discounts[0].percentage || 0
    : 0;
  const discountedPrice = isOnSale
    ? productPrice - productPrice * (discountPercentage / 100)
    : productPrice;

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center">
            <img
              src={selectedImage || "https://placehold.co/300"}
              alt={productName}
              className="h-128 w-176 rounded-lg shadow-lg"
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
                  <span className="line-through text-gray-500 text-lg">
                    ₪{productPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-green-700 font-semibold">
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
                  }`}
                  onClick={() => handleRating(i + 1)}
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
                className="w-1/2 bg-primaryColor text-white py-2 px-4 rounded-lg text-xl font-bold hover:bg-primaryColor transition">
                {t("product.addToCart")}
              </button>
              <button
                onClick={toggleWishlist}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
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
