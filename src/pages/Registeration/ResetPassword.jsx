import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { token } = useParams(); // טוקן מה-URL
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("resetPassword.errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || t("resetPassword.errors.failed"));
        return;
      }

      toast.success(t("resetPassword.success"));
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(t("resetPassword.errors.network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto my-10 p-6 bg-white border rounded-lg">
      <h1 className="text-xl font-bold mb-4 text-center">
        {t("resetPassword.title")}
      </h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">{t("resetPassword.newPassword")}</label>
        <input
          type="password"
          aria-label="New Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-full"
        />
        <label className="block mb-2">
          {t("resetPassword.confirmPassword")}
        </label>
        <input
          type="password"
          aria-label="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-bold text-xl rounded-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primaryColor hover:bg-secondaryColor"
          }`}>
            <h2>
              {loading ? t("resetPassword.loading") : t("resetPassword.submit")}
            </h2>
        </button>
      </form>
    </main>
  );
}
