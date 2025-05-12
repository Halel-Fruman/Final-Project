import { DialogTitle } from "@headlessui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function Register({ setToken, setUserId, onClose }) {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("register.errors.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/User/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          phoneNumber,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(t("register.errors.emailExists"));
        } else if (response.status === 503) {
          toast.error(t("register.errors.serverUnavailable"));
        } else {
          toast.error(t("register.errors.failed"));
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setToken(data.token);
      setUserId(data.userId);

      toast.success(t("register.success"));
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("register.errors.network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-md w-full max-w-md h-full overflow-auto mx-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-secondaryColor hover:text-primaryColor"
          aria-label="Close Modal">
          ✕
        </button>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <DialogTitle className="mt-5 text-center text-2xl font-bold tracking-tight text-gray-900">
          {t("register.title")}
        </DialogTitle>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 h-10/12 space-y-6">
        {/* First name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
            {t("register.first_name")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">
            {t("register.last_name")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900">
            {t("register.phoneNumber")}
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            {t("register.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            {t("register.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
            {t("register.confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-bold text-xl rounded-full shadow-sm ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primaryColor hover:bg-secondaryColor"
            }`}>
            {loading ? t("register.loading") : t("register.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
