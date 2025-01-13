import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";

const ProductPage = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/Example_products/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
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
        <p>No product found</p>
      </div>
    );
  }

  const language = i18n.language; // השפה הנוכחית
  const highlights = product.highlight[language] || [];
  const details = product.details[language] || "";

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* תמונת המוצר */}
          <div>
            <img
              src={product.picture}
              alt={product.name[language]}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* פרטי המוצר */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name[language]}
            </h1>
            <p className="text-xl text-secondaryColor font-semibold mb-4">
              ₪{product.price}
            </p>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(product.review?.average || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({product.review?.totalCount || 0} reviews)
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Highlights
              </h3>
              <ul className="list-disc pl-5 text-gray-700">
                {highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Details
              </h3>
              <p className="text-gray-700">{details}</p>
            </div>

            <button className="w-full bg-secondaryColor text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-primaryColor transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
