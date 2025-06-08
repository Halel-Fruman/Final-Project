import { useState } from "react";
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
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);


  // Handle form submission
  // This function is called when the user submits the login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Send login data to the server
    // The server will handle the authentication process
    try {
      const response = await fetch("/api/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // Check if the response is successful
      // If not, show an error message based on the status code
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - invalid credentials
          toast.error(t("login.invalidCredentials"));
          return;
        } else if (response.status === 403) {
          // Forbidden - email not verified
          toast.error(t("login.emailNotVerified"));
          setUnverifiedEmail(email);
          return;
        } else if (response.status === 503) {
          // Service unavailable - server down
          toast.error(t("login.serverUnavailable"));
          return;
        } else if (response.status === 404) {
          // Not found - user not found
          toast.error(t("login.userNotFound"));
          return;
        } else {
          toast.error(t("login.genericError"));
          return;
        }
      }

      // Parse the response data
      // The server should return a token and userId upon successful login
      const data = await response.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);

      setToken(data.accessToken);
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

  // Render the login form
  // This function returns the JSX for the login form
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
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryColor"
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
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-bold text-xl rounded-full shadow-sm ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primaryColor hover:bg-secondaryColor"
          }`}>
          {loading ? t("login.loading") : t("login.submit")}
        </button>
        {unverifiedEmail && (
  <div className="mt-4 text-center">
    <p className="text-sm text-gray-600">
      {t("login.resendVerificationText")}
    </p>
    <button
      onClick={async () => {
        try {
          const res = await fetch("/api/User/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: unverifiedEmail }),
          });
          if (res.ok) {
            toast.success(t("login.verificationEmailSent"));
          } else {
            toast.error(t("login.verificationEmailError"));
          }
        } catch (err) {
          console.error(err);
          toast.error(t("login.networkError"));
        }
      }}
      className="mt-1 text-blue-600 font-medium hover:underline"
    >
      {t("login.resendVerificationButton")}
    </button>
  </div>
)}

      </form>
      <p className="text-sm text-center mt-2">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => {
            onClose(); // סגור את המודל הנוכחי
            window.location.href = "/shop/forgot-password"; // ניווט לדף איפוס
          }}>
          {t("login.forgotPassword")}
        </button>
      </p>

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
