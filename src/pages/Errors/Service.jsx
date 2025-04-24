import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ServiceUnavailablePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">503</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("error503.title", "השירות אינו זמין כרגע")}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {t(
          "error503.message",
          "אנו חווים עומס או תחזוקה זמנית. אנא נסו שוב מאוחר יותר."
        )}
      </p>
      <Link
        to="/"
        className="bg-primaryColor text-white px-6 py-2 rounded-lg shadow hover:bg-secondaryColor transition"
      >
        {t("error503.back_to_home", "חזרה לדף הבית")}
      </Link>
    </div>
  );
};

export default ServiceUnavailablePage;
