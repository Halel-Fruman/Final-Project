import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/20/solid";

const ProductPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation(); // שימוש ב-i18n וב-t לצורך תרגום
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
          throw new Error(t("error.fetchProduct"));
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
  }, [id, t]);

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

  const language = i18n.language; // השפה הנוכחית
  const productName = product.name[language] || product.name["en"];
  const productDetails = product.details[language] || product.details["en"];
  const productHighlights =
    product.highlight[language] || product.highlight["en"] || [];
  const productPrice = product.price || t("product.noPrice");
  const productPicture = product.picture || "https://placehold.co/300";
  const productReview = product.review || { average: 0, totalCount: 0 };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* תמונת המוצר */}
          <div className="flex-shrink-0">
            <img
              src={productPicture}
              alt={productName}
              className="h-auto max-h-128 w-auto max-w-full rounded-lg shadow-lg"
            />
          </div>

          {/* פרטי המוצר */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex-grow min-h-128">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productName}
            </h1>
            <p className="text-xl text-secondaryColor font-semibold mb-4">
              ₪{productPrice}
            </p>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(productReview.average)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({productReview.totalCount} {t("product.reviews")})
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

            <button className="w-full bg-secondaryColor text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-primaryColor transition">
              {t("product.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
