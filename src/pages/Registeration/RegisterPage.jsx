import { DialogTitle } from "@headlessui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// The Register component is a functional component that takes the setToken, setUserId, and onClose as props
export default function Register({ setToken, setUserId, onClose }) {
  const [email, setEmail] = useState(""); // The email state is used to store the email value
  const [password, setPassword] = useState(""); // The password state is used to store the password value
  const [confirmPassword, setConfirmPassword] = useState(""); // The confirmPassword state is used to store the confirm password value
  const [phoneNumber, setPhoneNumber] = useState(""); // The phoneNumber state is used to store the phone number value
  const [firstName, setFirstName] = useState(""); // The firstName state is used to store the first name value
  const [lastName, setLastName] = useState(""); // The lastName state is used to store the last name value
  const [error, setError] = useState(null); // The error state is used to store the error message

  const { t } = useTranslation(); // The useTranslation hook is used to access the i18n instance

  // The handleSubmit function is an async function that handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate the password and confirm password
    if (password !== confirmPassword) {
      setError(t("register.errors.passwordMismatch"));
      return;
    }

    // Send a POST request to the server with the user details
    try {
      const response = await fetch("http://localhost:5000/User/register", {
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
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error(t("register.errors.failed"));
      }

      const data = await response.json();

      // Store the token and userId in the local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setToken(data.token);
      setUserId(data.userId);

      if (onClose) onClose(); // Close the modal
    } catch (err) {
      setError(err.message);
    }
  };

  // The return statement contains the JSX of the Register component
  return (
    <div className="relative bg-white rounded-lg  max-w-md w-full p-4">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-secondaryColor hover:text-primaryColor"
          aria-label="Close Modal">
          ✕
        </button>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <DialogTitle>
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          {t("register.title")}
        </h2>
        </DialogTitle>
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-900">
              {t("register.first_name")}
            </label>
            <div className="mt-2">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-900">
              {t("register.last_name")}
            </label>
            <div className="mt-2">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900">
              {t("register.email")}
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-900">
              {t("register.phoneNumber")}
            </label>
            <div className="mt-2">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900">
              {t("register.password")}
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-900">
              {t("register.confirmPassword")}
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-primaryColor sm:text-sm"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-primaryColor px-3 py-1.5 text-xl font-bold text-white shadow-sm hover:bg-primaryColor focus:outline-primaryColor"
              aria-label="Submit">
              {t("register.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
