/**
 * GlobalPromoPage.jsx
 * Admin page: create / edit / delete site-wide promotion
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";
import { useAlert } from "../../components/AlertDialog.jsx";

/* default empty promo object */
const emptyPromo = {
  title: "",
  type: "percent", // 'percent' | 'fixed'
  value: 10,
  start: "",
  end: "",
  bannerText: { he: "", en: "" },
};

const GlobalPromoPage = ({ token }) => {
  const { t, i18n } = useTranslation();
  const [promo, setPromo] = useState(emptyPromo);
  const { showAlert } = useAlert();

  /* load active promo once */
  useEffect(() => {
    fetchWithTokenRefresh("/api/promotions/global/active", token)
      .then((r) => r.json())
      .then((p) => (p ? setPromo(p) : setPromo(emptyPromo)))
      .catch(() => setPromo(emptyPromo));
  }, [token]);

  /* save promo (create or update) */
  const handleSave = async () => {
    const url = promo._id
      ? `/api/promotions/global/${promo._id}`
      : "/api/promotions/global";
    const method = promo._id ? "PUT" : "POST";

    await fetchWithTokenRefresh(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promo),
    });
    showAlert(t("globalPromo.saved"), "success"); //  “Saved”
  };

  /* delete promo with confirmation */
  const handleDelete = () => {
    if (!promo._id) return;

    showAlert(
      t("globalPromo.deleteConfirm"),
      "warning",
      async () => {
        try {
          await fetchWithTokenRefresh(`/api/promotions/global/${promo._id}`, {
            method: "DELETE",
          });
          setPromo(emptyPromo);
          showAlert(t("globalPromo.deleted"), "success");
        } catch {
          showAlert(t("globalPromo.deleteFailed"), "error");
        }
      },
      () => {}
    );
  };

  /* input helper */
  const input = (label, value, onChange, extra = {}) => (
    <>
      <label className="block mt-4 mb-1">{label}</label>
      <input
        className="border rounded-lg w-full p-2 mb-2"
        value={value}
        onChange={onChange}
        {...extra}
      />
    </>
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("globalPromo.title")}</h1>

      {input(t("globalPromo.form.promoTitle"), promo.title, (e) =>
        setPromo({ ...promo, title: e.target.value })
      )}

      <label className="block mt-4 mb-1">
        {t("globalPromo.form.typeLabel")}
      </label>
      <select
        className="border rounded-lg w-full p-2"
        value={promo.type}
        onChange={(e) => setPromo({ ...promo, type: e.target.value })}>
        <option value="percent">{t("globalPromo.form.percent")}</option>
        <option value="fixed">{t("globalPromo.form.fixed")}</option>
      </select>

      {input(
        t("globalPromo.form.value"),
        promo.value,
        (e) => setPromo({ ...promo, value: +e.target.value }),
        { type: "number", min: 0 }
      )}

      <div className="flex gap-4">
        {input(
          t("globalPromo.form.start"),
          promo.start?.slice(0, 10),
          (e) => setPromo({ ...promo, start: e.target.value }),
          { type: "date", className: "border rounded w-full p-2 flex-1" }
        )}
        {input(
          t("globalPromo.form.end"),
          promo.end?.slice(0, 10),
          (e) => setPromo({ ...promo, end: e.target.value }),
          { type: "date", className: "border rounded w-full p-2 flex-1" }
        )}
      </div>

      {input(t("globalPromo.form.bannerHe"), promo.bannerText.he, (e) =>
        setPromo({
          ...promo,
          bannerText: { ...promo.bannerText, he: e.target.value },
        })
      )}
      {input(t("globalPromo.form.bannerEn"), promo.bannerText.en, (e) =>
        setPromo({
          ...promo,
          bannerText: { ...promo.bannerText, en: e.target.value },
        })
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 bg-primaryColor text-white py-2 rounded-lg">
          {t("buttons.save")}
        </button>
        {promo._id && (
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg">
            {t("buttons.delete")}
          </button>
        )}
      </div>
    </div>
  );
};

export default GlobalPromoPage;
