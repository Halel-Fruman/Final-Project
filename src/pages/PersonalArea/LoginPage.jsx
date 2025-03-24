import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@headlessui/react";

//  The Login component is a functional component that takes setToken, setUserId, setUserRole, onClose, and openRegisterModal as props.
const Login = ({
  setToken,
  setUserId,
  setUserRole,
  onClose,
  openRegisterModal,
}) => {
  // useState hooks to store the email, password, error, and loading state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // useTranslation hook to access the i18n instance and the translation function t
  const { t } = useTranslation();
  // handleSubmit function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Try to send a POST request to the server to log in the user
    try {
      const response = await fetch("http://localhost:5000/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // If the response is not ok, throw an error
      if (!response.ok) {
        // If the status code is 401, throw an error with the message "Invalid credentials"
        if (response.status === 401) {
          throw new Error(t("login.invalidCredentials"));
        } else {
          // Otherwise, throw an error with the message "An error occurred"
          throw new Error(t("login.genericError"));
        }
      }
      // Parse the response to JSON
      const data = await response.json();
      // Store the token, userId, and role in the local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);
      // Set the token, userId, and role state with the fetched data
      setToken(data.token);
      setUserId(data.userId);
      setUserRole(data.role);

      onClose(); // Close the login modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Return the login form with the email, password, and submit button
  return (
    <div className="p-6 bg-white rounded-md w-full max-w-md mx-auto">
      <Dialog.Title
        as="h2"
        className="text-2xl font-bold text-center text-gray-900">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {t("login.title")}
        </h2>
      </Dialog.Title>

      {/*The form element with the email and password input fields */}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t("login.passwordPlaceholder")}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryColor"
          />
        </div>
        {/*If there is an error, display the error message */}
        {error && <p className="text-sm text-red-600">{error}</p>}
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
      {/*If the user is not a member, display a message with a link to the register modal */}
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
