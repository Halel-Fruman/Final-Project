// File: src/utils/exportToExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (products) => {
  const data = products.map((product) => {
    const discount = product.discounts?.[0];
    return {
      "שם (עברית)": product.name?.he || "",
      "שם (אנגלית)": product.name?.en || "",
      תיאור_עברית: product.description?.he || "",
      תיאור_אנגלית: product.description?.en || "",
      "מאפיינים (עברית)": product.highlight?.he?.join(" | ") || "",
      "מאפיינים (אנגלית)": product.highlight?.en?.join(" | ") || "",
      מחיר: product.price,
      "עלות ייצור": product.manufacturingCost || 0,
      רווח: product.price - (product.manufacturingCost || 0),
      מלאי: product.stock,
      'משלוח לחו"ל': product.internationalShipping ? "✔" : "✖",
      "אפשר להזמין גם כשאין במלאי": product.allowBackorder ? "✔" : "✖",
      קטגוריות: product.categories?.join(", "),
      תמונות: product.images?.join(" | ") || "",
      "אחוז מבצע": discount?.percentage || "",
      "תאריך התחלה": discount?.startDate?.slice(0, 10) || "",
      "תאריך סיום": discount?.endDate?.slice(0, 10) || "",
    };
  });

  const headers = Object.keys(data[0]);
  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = headers.map((key) => ({ wch: key.length + 2 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    "products.xlsx"
  );
};

export default exportToExcel;
