import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";

const ProductPage = ({ addToWishlist, wishlist, addToCart }) => {
  const { id } = useParams(); // מזהה המוצר מה-URL
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/Products/${id}`,

        );
        if (!response.ok) {
          throw new Error(t("error.fetchProduct"));
        }
        const data = await response.json();
        setProduct(data); // קבלת פרטי המוצר
        setSelectedImage(data.images[0]); // ברירת מחדל: התמונה הראשונה
        setRating(data.reviews?.average || 0); // טעינת דירוג מהמוצר
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
    addToCart({
      productId: product._id,
      quantity: 1,
    });
    alert(t("cart.added", { name: product.name[i18n.language] }));
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleRating = async (newRating) => {
    try {
      const response = await fetch(
        `http://localhost:5000/products/${id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("product.notFound")}</p>
      </div>
    );
  }

  const language = i18n.language;
  const productName = product.name[language] || product.name["en"];
  const productDetails =
    product.description[language] || product.description["en"];
  const productHighlights =
    product.highlight[language] || product.highlight["en"] || [];
  const productPrice = product.price || t("product.noPrice");
  const isInWishlist = wishlist?.find(
    (item) => String(item.productId) === String(product._id)
  );

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* תמונת המוצר */}
          <div className="flex-shrink-0">
            <img
              src={selectedImage || "https://placehold.co/300"}
              alt={productName}
              className="h-128 w-176 rounded-lg shadow-lg"
            />
            <div className="mt-4 flex gap-2">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleImageClick(image)}
                  className={`h-16 w-16 object-cover rounded-lg cursor-pointer shadow ${
                    selectedImage === image
                      ? "border-2 border-primaryColor"
                      : "border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* פרטי המוצר */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex-grow relative min-h-128">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productName}
            </h1>
            <p className="text-xl text-secondaryColor font-semibold mb-4">
              ₪{productPrice}
            </p>

            {/* דירוג כוכבים */}
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
                ({product.reviews?.totalCount || 0} {t("product.reviews")})
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.highlights")}
              </h3>
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
                className="w-1/2 bg-secondaryColor text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-primaryColor transition">
                {t("product.addToCart")}
              </button>
              <button
                onClick={toggleWishlist}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition">
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
    </div>
  );
};

export default ProductPage;
