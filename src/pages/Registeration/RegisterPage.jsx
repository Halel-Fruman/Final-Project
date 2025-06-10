import { DialogTitle, Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";
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
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Handle form submission
  // This function is called when the user submits the registration form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("register.errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    // Send registration data to the server
    // The server will handle the registration process
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
      // Check if the response is successful
      if (!response.ok) {
        if (response.status === 409) {
          // Conflict, email already exists
          toast.error(t("register.errors.emailExists"));
        } else if (response.status === 503) {
          // Service unavailable
          toast.error(t("register.errors.serverUnavailable"));
        } else {
          toast.error(t("register.errors.failed"));
        }
        return;
      }
      // Parse the response data
      // The server should return a token and userId upon successful registration
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setToken(data.token);
      setUserId(data.userId);

      // Show success message and close the modal
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
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-900">
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
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-900">
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
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-900">
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900">
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900">
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
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-900">
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
        {/* Terms and Conditions */}
        <div className="flex items-center mt-4">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mr-2"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            {t("register.terms")}{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="underline text-primaryColor hover:text-secondaryColor">
              {t("register.viewTerms")}
            </button>
          </label>
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
      { /* Terms and Conditions Modal */}
      <Dialog
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded bg-white p-6 shadow-lg overflow-y-auto max-h-[80vh]">
            <DialogTitle className="text-xl font-semibold mb-4">
              {t("register.termsTitle")}
            </DialogTitle>
            <div className="text-sm text-gray-700 space-y-4">
              <p>{t("register.termsContent")}</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-primaryColor text-white rounded-full hover:bg-secondaryColor">
                {t("register.close")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
