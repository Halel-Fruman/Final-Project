import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogTitle } from "@headlessui/react";
import toast from "react-hot-toast";

const Login = ({
  setToken,
  setUserId,
  setUserRole,
  onClose,
  openRegisterModal,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(t("login.invalidCredentials"));
          return;
        } else if (response.status === 503) {
          toast.error(t("login.serverUnavailable"));
          return;
        } else {
          toast.error(t("login.genericError"));
          return;
        }
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);

      setToken(data.token);
      setUserId(data.userId);
      setUserRole(data.role);

      toast.success(t("login.success"));
      onClose();
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(t("login.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-md w-full max-w-md mx-auto">
      <DialogTitle
        as="h2"
        className="text-2xl font-bold text-center text-gray-900">
        {t("login.title")}
      </DialogTitle>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700">
            {t("login.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("login.emailPlaceholder")}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700">
            {t("login.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t("login.passwordPlaceholder")}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-bold text-xl rounded-md shadow-sm ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primaryColor hover:bg-secondaryColor"
          }`}>
          {loading ? t("login.loading") : t("login.submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-m font-bold text-black">
        {t("login.notMember")}{" "}
        <button
          onClick={() => {
            onClose();
            openRegisterModal();
          }}
          className="font-bold text-primaryColor text-xl hover:text-secondaryColor"
          arial-label={t("login.registerLink")}>
          {t("login.registerLink")}
        </button>
      </p>

      <button
        onClick={onClose}
        className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800">
        {t("modal.close")}
      </button>
    </div>
  );
};

export default Login;
