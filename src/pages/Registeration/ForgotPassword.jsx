import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function ForgotPassword({ onClose }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || t("forgotPassword.errors.failed"));
        return;
      }

      toast.success(t("forgotPassword.success"));
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("forgotPassword.errors.network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg border">
      <h1 className="text-xl font-bold mb-4 text-center">{t("forgotPassword.title")}</h1>
      <form onSubmit={handleForgotPassword}>
        <h2>
        <label className="block mb-2">{t("forgotPassword.email")}</label>

        </h2>
        <input
          type="email"
          aria-label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2  text-white font-bold text-xl rounded-full ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-primaryColor hover:bg-secondaryColor"
          }`}>
          {loading ? t("forgotPassword.loading") : t("forgotPassword.submit")}
        </button>
      </form>
    </main>
  );
}
