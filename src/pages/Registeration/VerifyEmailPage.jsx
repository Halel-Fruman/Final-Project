import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState("loading");
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!token || hasFetched) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/User/verify-email/${token}`);
        if (response.ok) {
          setStatus("success");
          setTimeout(() => navigate("/"), 5000); // ניווט אוטומטי הביתה לאחר 3 שניות
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      } finally {
        setHasFetched(true); // מונע שליחה כפולה

      }
    };

    if (token && !hasFetched) verifyEmail();
  }, [token, hasFetched, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {status === "loading" && (
        <p className="text-lg text-gray-700">{t("verify_email.loading")}</p>
      )}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">
            {t("verify_email.success_title")}
          </h1>
          <p className="text-md mt-2">
            {t("verify_email.success_message")}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {t("verify_email.redirecting")}
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {t("verify_email.error_title")}
          </h1>
          <p className="text-md mt-2">
            {t("verify_email.error_message")}
          </p>
        </div>
      )}
    </div>
  );
}
