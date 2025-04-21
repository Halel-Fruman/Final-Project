import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primaryColor mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("not_found.title", "הדף לא נמצא")}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {t(
          "not_found.message",
          "נראה שכתובת ה־URL לא קיימת או שהדף הועבר למיקום אחר."
        )}
      </p>
      <Link
        to="/"
        className="bg-primaryColor text-white px-6 py-2 rounded-lg shadow hover:bg-secondaryColor transition"
      >
        {t("not_found.back_to_home", "חזרה לדף הבית")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
