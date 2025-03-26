import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

//  The ProductPage component is a functional component that takes the addToWishlist, wishlist, and addToCart as props.
const ProductPage = ({ addToWishlist, wishlist, addToCart }) => {
  const { id } = useParams(); // The useParams hook is used to access the URL parameters
  const { t, i18n } = useTranslation(); // The useTranslation hook is used to access the i18n instance
  const [product, setProduct] = useState(null); // The product state is used to store the product details
  const [isLoading, setIsLoading] = useState(true); // The isLoading state is used to track the loading state
  const [error, setError] = useState(null); // The error state is used to store the error message
  const [selectedImage, setSelectedImage] = useState(null); // The selectedImage state is used to store the selected image
  const [rating, setRating] = useState(0); // The rating state is used to store the product rating

  // The useEffect hook is used to fetch the product details based on the product ID
  useEffect(() => {
    // The fetchProduct function is an async function that fetches the product details from the server
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/Products/${id}`);
        if (!response.ok) {
          throw new Error(t("error.fetchProduct"));
        }
        const data = await response.json();
        setProduct(data); // Set the product state with the fetched data
        setSelectedImage(data.images[0]); // Set the selected image to the first image
        setRating(data.reviews?.average || 0); // Set the rating state with the average rating
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, t]);
  // The toggleWishlist function is used to add or remove a product from the wishlist
  const toggleWishlist = () => {
    const isInWishlist = wishlist?.some(
      (item) => String(item.productId) === String(product._id)
    );
    // Call the addToWishlist function with the product and isInWishlist parameters
    addToWishlist(product, isInWishlist);
  };
  // The handleAddToCart function is used to add the product to the cart
  const handleAddToCart = () => {
    // Call the addToCart function with the product ID and quantity parameters
    addToCart({
      productId: product._id,
      quantity: 1,
    });
    toast.success(t("wishlist.addToCart") + " ✅");

  };
  // The handleImageClick function is used to set the selected image
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };
  // The handleRating function is used to update the product rating
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
  // If an error occurs while fetching the product, display the error message
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  // If the product is not found, display a message
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
    <main className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-shrink-0">
            <img
              src={selectedImage || "https://placehold.co/300"}
              alt={productName}
              className="h-128 w-176 rounded-lg shadow-lg"
            />
            {/*The product images are displayed as thumbnails below the main image */}
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

          {/* The product details are displayed on the right side of the page */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex-grow relative min-h-128">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productName}
            </h1>
            <p className="text-xl text-primaryColor font-bold mb-4">
              ₪{productPrice}
            </p>
            {/*The product rating is displayed as stars with the average rating */}
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
            {/*The product highlights are displayed as a list */}
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
            {/*The product details are displayed below the highlights */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.details")}
              </h3>
              <p className="text-gray-700">{productDetails}</p>
            </div>
            {/*The Add to Cart and Add to Wishlist buttons are displayed at the bottom of the page */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                className="w-1/2 bg-primaryColor text-white py-2 px-4 rounded-lg text-xl font-bold hover:bg-primaryColor transition">
                {t("product.addToCart")}
              </button>
              {/*The toggleWishlist function is called when the wishlist button is clicked */}
              <button
                onClick={toggleWishlist}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
>
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
