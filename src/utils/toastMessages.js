import toast from "react-hot-toast";

/**
 * מציג toast רגיל, לפי סוג ההודעה
 * @param {"success"|"error"|"default"} type - סוג ההודעה
 * @param {string} message - הטקסט שיוצג
 */
export const showToast = (type = "success", message) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast(message);
  }
};

/**
 * toast מהיר להצלחה
 */
export const toastSuccess = (message) => toast.success(message);

/**
 * toast מהיר לשגיאה
 */
export const toastError = (message) => toast.error(message);

/**
 * מציג Toast של טעינה ומחזיר את המזהה שלו
 * @returns {string} toastId
 */
export const toastLoading = (message = "טוען...") => {
  return toast.loading(message);
};

/**
 * מבטל toast לפי מזהה (או את כולם אם אין מזהה)
 */
export const toastDismiss = (toastId) => {
  if (toastId) toast.dismiss(toastId);
  else toast.dismiss();
};

/**
 * מבצע פעולה אסינכרונית ומציג toast לפי התוצאה
 * @param {Function} asyncFn - הפונקציה האסינכרונית שאתה רוצה להריץ
 * @param {Object} messages - הודעות מותאמות
 * @returns {any} התוצאה של הפונקציה האסינכרונית
 */
export const runWithToast = async (asyncFn, {
  loading = "טוען...",
  success = "בוצע בהצלחה!",
  error = "אירעה שגיאה!",
} = {}) => {
  const toastId = toast.loading(loading);
  try {
    const result = await asyncFn();
    toast.success(success);
    toast.dismiss(toastId);
    return result;
  } catch (err) {
    toast.error(error);
    toast.dismiss(toastId);
    console.error(err);
    return null;
  }
};
