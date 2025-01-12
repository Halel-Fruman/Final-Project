import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";

const ProductPage = () => {
  const { id } = useParams();

  const product = {
    id,
    name: `Product ${id}`,
    price: `₪${(100 * id).toFixed(2)}`,
    description: `This is a detailed description of Product ${id}.`,
    highlights: [
      "High-quality material",
      "Innovative design",
      "Durable and long-lasting",
    ],
    details:
      "This product is made from premium materials and designed for comfort and style. Perfect for all occasions.",
    images: [
      "https://placehold.co/200",
      "https://placehold.co/40",
      "https://placehold.co/300",
    ],
    reviews: { average: 4, totalCount: 34 },
  };

  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* גלריית תמונות */}
          <div>
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="flex gap-4 mt-4">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index}`}
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-20 rounded-lg cursor-pointer border ${
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* פרטי המוצר */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-xl text-secondaryColor font-semibold mb-4">
              {product.price}
            </p>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 ${
                    i < product.reviews.average
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                ({product.reviews.totalCount} reviews)
              </span>
            </div>
            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Highlights
              </h3>
              <ul className="list-disc pl-5 text-gray-700">
                {product.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Details
              </h3>
              <p className="text-gray-700">{product.details}</p>
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
