import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: "Smartphone",
      price: "$699.99",
      imageSrc: "https://placehold.co/250x150",
      imageAlt: "Smartphone image",
    },
    {
      id: 2,
      name: "Laptop",
      price: "$1299.99",
      imageSrc: "https://placehold.co/250x150",
      imageAlt: "Laptop image",
    },
    {
      id: 3,
      name: "Headphones",
      price: "$199.99",
      imageSrc: "https://placehold.co/250x150",
      imageAlt: "Headphones image",
    },
  ];

  const categories = [
    { id: 1, name: t("categories.electronics") },
    { id: 2, name: t("categories.clothing") },
    { id: 3, name: t("categories.home_garden") },
    { id: 4, name: t("categories.beauty_health") },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="relative bg-secondaryColor text-white">
        {/* Title and Subtitle */}
        <h1 className="text-xxl font text-white'-200">{t("welcome")}</h1>
        <p className="mt-2 text-xl text-white-300">{t("welcome_subtitle")}</p>
      </header>

      {/* Categories Section */}
      <section className="my-10 px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-6">{t("categories.title")}</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-100 p-4 rounded-lg text-center shadow hover:shadow-lg transition"
            >
              <h5 className="text-lg font-semibold text-gray-700">{category.name}</h5>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="my-10 px-6 lg:px-12">
        <h2 className="text-center text-2xl font-bold mb-6">{t("featured_products")}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={product.imageSrc}
                alt={product.imageAlt}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-secondaryColor text-xl font-bold mt-2">{product.price}</p>
                <Link
                  to={`/product/${product.id}`}
                  className="mt-4 inline-block bg-secondaryColor text-white py-2 px-4 rounded hover:bg-primaryColor transition"
                  aria-label={t("view_details_of", { product: product.name })}
                >
                  {t("view_details")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
