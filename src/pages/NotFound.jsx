// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-6xl font-bold text-primaryColor mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">הדף שחיפשת לא קיים.</p>
      <Link
        to="/"
        className="bg-primaryColor text-white px-6 py-2 rounded-md shadow hover:bg-secondaryColor transition"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
};

export default NotFound;
