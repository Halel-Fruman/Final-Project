import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// The AddAddressPage component is a functional component that takes the userId as a prop
const AddAddressPage = ({ userId }) => {
  const { t } = useTranslation(); // The useTranslation hook is used to access the i18n instance
  const [address, setAddress] = useState(""); // The address state is used to store the address value
  const navigate = useNavigate(); // The useNavigate hook is used to navigate to a different route

  // The handleSubmit function is an async function that handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send a POST request to the server with the address
    try {
      const response = await fetch(
        `http://localhost:5000/User/${userId}/add-address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        }
      );
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error("Failed to add address");
      }
      alert(t("addAddress.success"));
      navigate("/personal-area"); // Navigate to the personal area page
    } catch (err) {
      console.error(err.message);
      alert(t("addAddress.errors.failed"));
    }
  };

  // The return statement contains the JSX of the AddAddressPage component
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-4">{t("addAddress.title")}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  {t("addAddress.address")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                {t("addAddress.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressPage;
