// קובץ: ProductManagement.jsx
import React, { useState, useEffect,useRef  } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLocation, useNavigate } from "react-router-dom";
import VoiceInputButton from "../../components/VoiceInputButton"; // או הנתיב שמתאים לך



  
const ProductManagement = ({
  storeId,
  autoOpenAddForm = false,
  autofill = {},
}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(
    autoOpenAddForm || false
  );
const isAddingProductRef = useRef(isAddingProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const { showAlert } = useAlert();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const navigate = useNavigate();
const [pendingEditRequest, setPendingEditRequest] = useState(null);
const [pendingAutofillPayload, setPendingAutofillPayload] = useState(null);
const [pendingEditFields, setPendingEditFields] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true); // נשתמש באותו מודאל של הוספה
  };

  const [newProduct, setNewProduct] = useState(() => {
    const safe = autofill || {};
    return {
      nameEn: safe.nameEn || "",
      nameHe: safe.nameHe || "",
      price: safe.price || "",
      stock: safe.stock || "",
      manufacturingCost: safe.manufacturingCost || "",
      descriptionEn: safe.descriptionEn || "",
      descriptionHe: safe.descriptionHe || "",
      selectedCategories: safe.selectedCategories || [],
      allowBackorder: safe.allowBackorder || false,
      internationalShipping: safe.internationalShipping || false,
      images: safe.images || [],
      newImageUrl: "",
      discountPercentage: safe.discountPercentage || "",
      discountStart: safe.discountStart || "",
      discountEnd: safe.discountEnd || "",
      highlightHe: safe.highlightHe || [],
      highlightEn: safe.highlightEn || [],
    };
  });
useEffect(() => {
  isAddingProductRef.current = isAddingProduct;
}, [isAddingProduct]);

 useEffect(() => {
    const handler = (e) => {
      const data = e.detail;
      if (data) {
        setAutofillPayload(data);
        setIsAddingProduct(true);
      }
    };

    window.addEventListener("autofillProductForm", handler);
    return () => window.removeEventListener("autofillProductForm", handler);
  }, []);
  
  useEffect(() => {
  if (pendingAutofillPayload) {
    console.log("✅ הטופס נפתח — ממלא את השדות עכשיו.");
    const mapped = mapPayloadToNewProduct(pendingAutofillPayload);
    setNewProduct((prev) => ({ ...prev, ...mapped }));
    setPendingAutofillPayload(null);
  }
}, [isAddingProduct, pendingAutofillPayload]);


  useEffect(() => {
    const handleOpenAdd = () => {
      setIsAddingProduct(true);
      setEditingProduct(null);
      console.log("Open Add Product Form triggered");
    };

    window.addEventListener("openAddProduct", handleOpenAdd);
    return () => window.removeEventListener("openAddProduct", handleOpenAdd);
  }, []);
  const location = useLocation();
  


  useEffect(() => {
  const handleFindProductByName = (e) => {
    const { productName } = e.detail;
    if (productName) {
      const productId = findProductIdByName(productName);
      if (productId) {
        window.dispatchEvent(
          new CustomEvent("openEditProductForm", { detail: { productId } })
        );
      } else {
        console.warn("לא נמצא מוצר עם השם:", productName);
        showAlert("לא נמצא מוצר עם השם שסיפקת.", "error");
      }
    }
  };

  window.addEventListener("findProductByName", handleFindProductByName);
  return () => window.removeEventListener("findProductByName", handleFindProductByName);
}, [products]);


  useEffect(() => {
  const handleEditProductForm = (e) => {
    const { productId } = e.detail;
    if (productId) {
      const productToEdit = products.find((p) => p._id === productId);
      if (productToEdit) {
        setEditingProduct(productToEdit);
        setIsAddingProduct(true); // יפתח את הטופס
      } else {
        console.error("⚠️ לא נמצא מוצר עם המזהה:", productId);
      }
    }
  };

  window.addEventListener("openEditProductForm", handleEditProductForm);
  return () => window.removeEventListener("openEditProductForm", handleEditProductForm);
}, [products]);

useEffect(() => {
  const handleAutofillEdit = (e) => {
    const updates = e.detail;
    if (!updates) return;

    if (isAddingProductRef.current) {
      // טופס פתוח — נעדכן מיידית
      setNewProduct((prev) => ({
        ...prev,
        ...mapUpdatesToNewProduct(updates),
      }));
    } else {
      // טופס עדיין לא פתוח — נשמור להמשך
      setPendingEditFields(updates);

    }
  };

  window.addEventListener("autofillEditProductForm", handleAutofillEdit);
  return () =>
    window.removeEventListener("autofillEditProductForm", handleAutofillEdit);
}, []);

useEffect(() => {
  if (pendingEditFields && isAddingProduct) {
    // מילוי ברגע שהטופס נפתח
    setNewProduct((prev) => ({
      ...prev,
      ...mapUpdatesToNewProduct(pendingEditFields),
    }));
    setPendingEditFields(null);
  }
}, [isAddingProduct, pendingEditFields]);





useEffect(() => {
  const handler = (e) => {
    console.log("📥 קיבלתי בקשה לפתוח מוצר לעריכה:", e.detail);
    setPendingEditRequest(e.detail);
  };

  window.addEventListener("openEditProduct", handler);
  return () => window.removeEventListener("openEditProduct", handler);
}, []);

useEffect(() => {
  if (pendingEditRequest && products.length > 0) {
    const { productName } = pendingEditRequest;

    console.log("🔍 מוצא ID למוצר:", productName);
    const productId = findProductIdByName(productName);

    if (productId) {
      console.log("✅ נמצא מוצר, שולח פתיחה:", productId);
      window.dispatchEvent(
        new CustomEvent("openEditProductForm", { detail: { productId } })
      );
      setPendingEditRequest(null);
    } else {
      console.warn("❌ לא נמצא מוצר עם השם:", productName);
      showAlert("לא נמצא מוצר עם השם שסיפקת.", "error");
      setPendingEditRequest(null);
    }
  }
}, [pendingEditRequest, products]);


  useEffect(() => {
    if (location.state?.openAddProductForm) {
      setIsAddingProduct(true);
      setEditingProduct(null);

      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    axios
      .get(`/api/products/by-store?store=${storeId}`)
      .then((res) => setProducts(res.data))
      .catch(() => showAlert("אירעה שגיאה בעת קבלת המוצרים", "error"));

    axios
      .get(`/api/Category`)
      .then((res) => setCategories(res.data))
      .catch(() => showAlert("אירעה שגיאה בעת קבלת הקטגוריות", "error"));
  }, [storeId]);

  const handleDelete = (productId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את המוצר?")) {
      axios
        .delete(`/api/products/${storeId}/${productId}`)
        .then(() => {
          setProducts(products.filter((p) => p._id !== productId));
          showAlert("המוצר נמחק בהצלחה", "success");
        })
        .catch(() => {
          showAlert("אירעה שגיאה במחיקת המוצר", "error");
        });
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      nameEn: "",
      nameHe: "",
      price: "",
      stock: "",
      manufacturingCost: "",
      descriptionEn: "",
      descriptionHe: "",
      selectedCategories: [],
      allowBackorder: false,
      internationalShipping: false,
      images: [],
      newImageUrl: "",
      discountPercentage: "",
      discountStart: "",
      discountEnd: "",
      highlightHe: [],
      highlightEn: [],
    });
  };
   
const mapPayloadToNewProduct = (payload) => {
  return {
    name: {
      en: payload.nameEn || "",
      he: payload.nameHe || "",
    },
    description: {
      en: payload.descriptionEn || "",
      he: payload.descriptionHe || "",
    },
    price: payload.price ?? "", // אין צורך להמיר ל-String, מחיר הוא מספר
    stock: payload.stock ?? "",
    manufacturingCost: payload.manufacturingCost ?? "",
    highlight: {
      en: payload.highlightEn || [],
      he: payload.highlightHe || [],
    },
    selectedCategories: payload.selectedCategories || [],
    allowBackorder: payload.allowBackorder || false,
    internationalShipping: payload.internationalShipping || false,
    images: payload.images || [],
    newImageUrl: "",
    discountPercentage: payload.discountPercentage ?? "",
    discountStart: payload.discountStart || "",
    discountEnd: payload.discountEnd || "",
  };
};



  const findProductIdByName = (productName) => {
  if (!productName) return null;
  
  const normalized = productName.trim().toLowerCase();

  const found = products.find((product) => {
    const nameHe = product.name?.he?.toLowerCase() || "";
    const nameEn = product.name?.en?.toLowerCase() || "";
    return nameHe.includes(normalized) || nameEn.includes(normalized);
  });

  return found?._id || null;
};


  const mapUpdatesToNewProduct = (updates) => {
  const mapped = {};
  if (updates.nameHe) mapped.nameHe = updates.nameHe;
  if (updates.nameEn) mapped.nameEn = updates.nameEn;
  if (updates.price) mapped.price = updates.price;
  if (updates.stock) mapped.stock = updates.stock;
  if (updates.descriptionHe) mapped.descriptionHe = updates.descriptionHe;
  if (updates.descriptionEn) mapped.descriptionEn = updates.descriptionEn;
  if (updates.highlightHe) mapped.highlightHe = updates.highlightHe;
  if (updates.highlightEn) mapped.highlightEn = updates.highlightEn;
  if (updates.manufacturingCost) mapped.manufacturingCost = updates.manufacturingCost;
  if (updates.allowBackorder !== undefined) mapped.allowBackorder = updates.allowBackorder;
  if (updates.internationalShipping !== undefined) mapped.internationalShipping = updates.internationalShipping;
  if (updates.images) mapped.images = updates.images;
  if (updates.discountPercentage) mapped.discountPercentage = updates.discountPercentage;
  if (updates.discountStart) mapped.discountStart = updates.discountStart;
  if (updates.discountEnd) mapped.discountEnd = updates.discountEnd;
  if (updates.selectedCategories) mapped.selectedCategories = updates.selectedCategories;
  return mapped;
};


  const handleSaveProduct = () => {
    if (
      !newProduct.nameEn ||
      !newProduct.nameHe ||
      !newProduct.price ||
      newProduct.selectedCategories.length === 0
    ) {
      showAlert("יש למלא את כל השדות החיוניים", "error");
      return;
    }
    if (
      newProduct.discountStart &&
      newProduct.discountEnd &&
      new Date(newProduct.discountEnd) < new Date(newProduct.discountStart)
    ) {
      showAlert("תאריך הסיום לא יכול להיות לפני תאריך ההתחלה", "error");
      return;
    }

    const payload = {
      name: { en: newProduct.nameEn, he: newProduct.nameHe },
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      manufacturingCost: Number(newProduct.manufacturingCost),
      highlight: {
        he: newProduct.highlightHe.filter((s) => s.trim() !== ""),
        en: newProduct.highlightEn.filter((s) => s.trim() !== ""),
      },
      description: {
        en: newProduct.descriptionEn,
        he: newProduct.descriptionHe,
      },
      categories: newProduct.selectedCategories,
      allowBackorder: newProduct.allowBackorder,
      internationalShipping: newProduct.internationalShipping,
      images: newProduct.images,
    };

    if (
      newProduct.discountPercentage &&
      newProduct.discountStart &&
      newProduct.discountEnd
    ) {
      payload.discounts = [
        {
          percentage: Number(newProduct.discountPercentage),
          startDate: newProduct.discountStart,
          endDate: newProduct.discountEnd,
        },
      ];
    }

    const url = editingProduct
      ? `/api/products/${storeId}/${editingProduct._id}`
      : `/api/products/${storeId}`;

    const method = editingProduct ? axios.put : axios.post;

    method(url, payload)
      .then((res) => {
        if (editingProduct) {
          setProducts(
            products.map((p) => (p._id === editingProduct._id ? res.data : p))
          );
        } else {
          setProducts([...products, res.data]);
        }
        setIsAddingProduct(false);
        resetNewProductForm();
        showAlert(
          editingProduct ? "המוצר עודכן בהצלחה!" : "המוצר נוסף בהצלחה!",
          "success"
        );
        setEditingProduct(null);
      })
      .catch(() => showAlert("אירעה שגיאה בשמירת המוצר", "error"));
  };

  useEffect(() => {
    if (editingProduct) {
      const discount = editingProduct.discounts?.[0];
      setNewProduct({
        nameEn: editingProduct.name.en,
        nameHe: editingProduct.name.he,
        price: editingProduct.price,
        stock: editingProduct.stock,
        manufacturingCost: editingProduct.manufacturingCost,
        descriptionEn: editingProduct.description?.en || "",
        descriptionHe: editingProduct.description?.he || "",
        selectedCategories: editingProduct.categories || [],
        allowBackorder: editingProduct.allowBackorder || false,
        internationalShipping: editingProduct.internationalShipping || false,
        images: editingProduct.images || [],
        newImageUrl: "",
        discountPercentage: discount?.percentage || "",
        discountStart: discount?.startDate?.slice(0, 10) || "",
        discountEnd: discount?.endDate?.slice(0, 10) || "",
        highlightHe: editingProduct.highlight?.he || [],
        highlightEn: editingProduct.highlight?.en || [],
      });
    }
  }, [editingProduct]);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    setNewProduct((prev) => {
      let selected = [...prev.selectedCategories];

      if (checked) selected.push(value);
      else selected = selected.filter((id) => id !== value);
      return { ...prev, selectedCategories: selected };
    });
  };

  const handleCancel = () => {
    showAlert(
      "האם אתה בטוח שברצונך לבטל?",
      "warning",
      () => {
        setIsAddingProduct(false);
        setIsEditing(false);
        setEditProductId(null);
        setEditingProduct(null);
        resetNewProductForm();
        window.history.replaceState({}, document.title);
      },
      () => {}
    );
  };

  const filteredProducts = products.filter((product) => {
    const nameHe = product.name?.he?.toLowerCase() || "";
    const nameEn = product.name?.en?.toLowerCase() || "";
    return (
      nameHe.includes(searchQuery.toLowerCase()) ||
      nameEn.includes(searchQuery.toLowerCase())
    );
  });
  const handleExportProducts = () => {
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

    worksheet["!cols"] = headers.map((key) => ({
      wch: key.length + 2,
    }));

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

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 text-center">ניהול מוצרים</h1>

      <div className="mb-4 mr-4 flex justify">
        <button
          className="bg-blue-700 font-bold text-xl  ml-4 text-white px-4 py-2 rounded"
          onClick={() => setIsAddingProduct(true)}>
          <h2>הוסף מוצר</h2>
        </button>

        <div className="flex w-full max-w-md gap-2">
          <input
            type="text"
            placeholder="חפש מוצר לפי שם..."
            className="flex-grow p-2 border rounded-md shadow-sm text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleExportProducts}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          title="ייצוא לאקסל">
          <Icon icon="mdi:export" width="20" />
        </button>
      </div>


      {/*---page--*/}

      {isAddingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {editingProduct ? "עריכת מוצר" : "הוסף מוצר"}
            </h2>
{/* שם מוצר */}
<div className="mb-4 grid grid-cols-2 gap-4">
  <div>
    <label className="block mb-1 font-bold">שם בעברית</label>
    <div className="relative w-full">
      
      <input
        aria-label="Product Name in Hebrew"
        type="text"
        className="w-full border    pr-14 pl-3 py-2 py-2 rounded-full shadow-sm" // יותר padding בשביל המיקרופון
        value={newProduct.nameHe}
        onChange={(e) =>
          setNewProduct({ ...newProduct, nameHe: e.target.value })
        }
        
      />
      <VoiceInputButton
        lang="he-IL"
        onResult={(text) => setNewProduct((prev) => ({ ...prev, nameHe: text }))}
      />
    </div>
  </div>
  <div>
    <label className="block mb-1 font-bold">שם באנגלית</label>
    <div className="relative">
      <input
        aria-label="Product Name in English"
        type="text"
        className="w-full border px-12 py-2 rounded-full shadow-sm"
        value={newProduct.nameEn}
        onChange={(e) =>
          setNewProduct({ ...newProduct, nameEn: e.target.value })
        }
      />
      <VoiceInputButton
        lang="en-US"
        onResult={(text) => setNewProduct((prev) => ({ ...prev, nameEn: text }))}
      />
    </div>
  </div>
</div>

{/* תיאור */}
<div className="mb-4">
  <label className="block mb-1 font-bold">תיאור בעברית</label>
  <div className="relative">
    <textarea
      aria-label="Product Description in Hebrew"
      className="w-full border px-12 py-2 rounded-full shadow-sm"
      value={newProduct.descriptionHe}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          descriptionHe: e.target.value,
        })
      }
    />
    <VoiceInputButton
      lang="he-IL"
      onResult={(text) => setNewProduct((prev) => ({ ...prev, descriptionHe: text }))}
    />
  </div>
</div>

<div className="mb-4">
  <label className="block mb-1 font-bold">תיאור באנגלית</label>
  <div className="relative">
    <textarea
      aria-label="Product Description in English"
      className="w-full border px-12 py-2 rounded-full shadow-sm"
      value={newProduct.descriptionEn}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          descriptionEn: e.target.value,
        })
      }
    />
    <VoiceInputButton
      lang="en-US"
      onResult={(text) => setNewProduct((prev) => ({ ...prev, descriptionEn: text }))}
    />
  </div>
</div>
<div className="mb-4">
  <label className="block font-bold mb-1 font-bold">מאפיינים בעברית (שורה לכל מאפיין)</label>
  <div className="relative">
    <textarea
      aria-label="Product Highlights in Hebrew"
      className="w-full border px-10 py-2 rounded-full shadow-sm"
      value={newProduct.highlightHe.join("\n")}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          highlightHe: e.target.value.split("\n"),
        })
      }
    />
    <VoiceInputButton
      lang="he-IL"
      onResult={(text) => {
        const features = text
          .split(/סיים|פסיק|נקודה|,|\.|;/g)
          .map((item) => item.trim())
          .filter((item) => item);

        setNewProduct((prev) => ({
          ...prev,
          highlightHe: features,
        }));
      }}
    />
        </div>

    {/* טקסט עזר בפנים */}
    <div className=" text-gray-400 text-xs mt-0 bg-opacity-80 px-1 rounded">
      בעת תמלול אמור "סיים", "פסיק" או "נקודה" כדי להפריד בין מאפיינים.
  </div>
</div>


<div className="mb-4">
  <label className="block font-bold mb-1">מאפיינים באנגלית (שורה לכל מאפיין)</label>
  <div className="relative">
    <textarea
      aria-label="Product Highlights in English"
      className="w-full h- border px-10 py-2 rounded-full shadow-sm"
      value={newProduct.highlightEn.join("\n")}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          highlightEn: e.target.value.split("\n"),
        })
      }
    />
    <VoiceInputButton
      lang="en-US"
      onResult={(text) => {
        const features = text
          .split(/comma|dot|semicolon|end/gi)
          .map((item) => item.trim())
          .filter((item) => item);

        setNewProduct((prev) => ({
          ...prev,
          highlightEn: features,
        }));
      }}
    />
  </div>
   <div className=" text-gray-400 text-xs mt-0 bg-opacity-80 px-1 rounded">
   .While dictating, say "comma", "dot", or "end" to separate features
  </div>
</div>


            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">מחיר</label>
                <input
                  aria-label="Product Price"
                  type="number"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-bold font-bold">עלות ייצור</label>
                <input
                  aria-label="Manufacturing Cost"
                  type="number"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.manufacturingCost || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      manufacturingCost: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-bold">אחוז מבצע</label>
                <input
                  aria-label="Discount Percentage"
                  type="number"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.discountPercentage}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      discountPercentage: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">תאריך התחלה</label>
                <input
                  aria-label="Discount Start Date"
                  type="date"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.discountStart}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      discountStart: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">תאריך סיום</label>
                <input
                  aria-label="Discount End Date"
                  type="date"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.discountEnd}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      discountEnd: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-bold">מלאי</label>
                <input
                  aria-label="Product Stock"
                  type="number"
                  className="w-full border px-3 py-2 rounded-full"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  aria-label="Allow Backorder"
                  type="checkbox"
                  checked={newProduct.allowBackorder || false}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      allowBackorder: e.target.checked,
                    })
                  }
                />
                <label>אפשר הזמנה כשאין מלאי</label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  aria-label="International Shipping"
                  type="checkbox"
                  checked={newProduct.internationalShipping || false}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      internationalShipping: e.target.checked,
                    })
                  }
                />
                <label>משלוח לחו"ל</label>
              </div>
            </div>

            {/* קטגוריות */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">קטגוריות:</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label key={category._id} className="flex items-center gap-2">
                    <input
                      aria-label={`Category ${category.name.he}`}
                      type="checkbox"
                      value={category._id}
                      checked={newProduct.selectedCategories.includes(
                        category._id
                      )}
                      onChange={handleCategoryChange}
                    />
                    {category.name.he} / {category.name.en}
                  </label>
                ))}
              </div>
            </div>

            {/* תמונה */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">תמונות המוצר</label>

              {/* שדה להוספת קישור */}
              <div className="flex gap-2 mb-2 flex-col sm:flex-row">
                <input
                  aria-label="Image URL"
                  type="text"
                  placeholder="הדבק קישור לתמונה"
                  className="flex-grow border px-3 py-2 rounded-full"
                  value={newProduct.newImageUrl || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      newImageUrl: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
className="bg-white text-green-600 font-semibold text-base px-4 py-2 rounded-full border-2 border-green-500 shadow-sm hover:bg-green-50 hover:shadow-md hover:scale-105 transform transition duration-300 ease-in-out"

                  onClick={() => {
                    if (newProduct.newImageUrl) {
                      setNewProduct({
                        ...newProduct,
                        images: [...newProduct.images, newProduct.newImageUrl],
                        newImageUrl: "",
                      });
                    }
                  }}>
                  הוסף קישור
                </button>
              </div>

              {/* שדה להעלאת קובץ */}
              <div className="flex gap-2 mb-2 flex-col sm:flex-row">
                <input
                  aria-label="Upload Image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                      const response = await fetch(
                        "/api/products/upload-image",
                        {
                          method: "POST",
                          body: formData,
                        }
                      );

                      const data = await response.json();
                      if (response.ok && data.imageUrl) {
                        setNewProduct((prev) => ({
                          ...prev,
                          images: [
                            ...prev.images,
                            `https://ilan-israel.co.il/api${data.imageUrl}`,
                          ],
                        }));
                      } else {
                        console.error(
                          "Upload failed:",
                          data.message || "Unknown error"
                        );
                        alert("שגיאה בהעלאת התמונה");
                      }
                    } catch (err) {
                      console.error("Upload error:", err);
                      alert("שגיאה בשרת בעת העלאה");
                    }
                  }}
                />
              </div>

              {/* תצוגת תמונות */}
              <div className="flex flex-wrap gap-4">
                {newProduct.images?.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      aria-label={`Product Image ${index}`}
                      src={img}
                      alt={`image-${index}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-tr rounded-bl"
                      onClick={() => {
                        const updatedImages = [...newProduct.images];
                        updatedImages.splice(index, 1);
                        setNewProduct({ ...newProduct, images: updatedImages });
                      }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300"
                onClick={handleCancel}>
                ביטול
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
                onClick={handleSaveProduct}
                data-chat-approve="true">
                {editingProduct ? "שמור שינויים" : "הוסף מוצר"}
              </button>
            </div>
          </div>
        </div>
      )}
{/*---page--*/}

      <div className="border rounded-lg shadow overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="w-full table-fixed text-sm text-right">
            <thead className="bg-gray-100 font-bold block w-full">
              <tr className="table w-full">
                <th className="p-2 border w-[8%]">תמונה</th>
                <th className="p-2 border w-[18%]">שם</th>
                <th className="p-2 border w-[10%]">מחיר</th>
                <th className="p-2 border w-[10%]">עלות ייצור</th>
                <th className="p-2 border w-[10%]">רווח</th>
                <th className="p-2 border w-[10%]">מלאי</th>
                <th className="p-2 border w-[10%]">משלוח לחו"ל</th>
                <th className="p-2 border w-[10%]">מבצע</th>
                <th className="p-2 border w-[14%]">פעולות</th>
              </tr>
            </thead>
            <tbody className="block max-h-[400px] overflow-y-auto w-full">
              {filteredProducts.map((product) => {
                const firstImage = product.images?.[0];
                const discount = product.discounts?.find((d) => {
                  const now = new Date();
                  return (
                    new Date(d.startDate) <= now && now <= new Date(d.endDate)
                  );
                });
                const profit = product.price - (product.manufacturingCost || 0);

                return (
                  <tr
                    key={product._id}
                    className="table w-full border-t hover:bg-gray-50">
                    <td className="p-2 border w-[8%]">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt="product"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">ללא תמונה</span>
                      )}
                    </td>
                    <td className="p-2 border w-[18%]">
                      {product.name.he} / {product.name.en}
                    </td>
                    <td className="p-2 border w-[10%]">{product.price}₪</td>
                    <td className="p-2 border w-[10%]">
                      {product.manufacturingCost ? (
                        <span className="text-red-900">
                          {product.manufacturingCost}₪
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border w-[10%]">
                      <span
                        className={
                          profit > 0 ? "text-green-900" : "text-red-600"
                        }>
                        {profit}₪
                      </span>
                    </td>
                    <td className="p-2 border w-[10%]">{product.stock}</td>
                    <td className="p-2 border w-[10%]">
                      {product.internationalShipping ? (
                        <span className="text-purple-600 text-lg">✔</span>
                      ) : (
                        <span className="text-pink-600 text-lg">✖</span>
                      )}
                    </td>
                    <td className="p-2 border w-[10%] text-sm">
                      {discount ? (
                        <div className="flex flex-col">
                          <span
                            className={
                              new Date(discount.endDate) < new Date()
                                ? "text-red-500"
                                : "text-green-900"
                            }>
                            {discount.percentage}%
                          </span>
                          <span className="text-gray-800 text-xs">
                            עד{" "}
                            {new Date(discount.endDate).toLocaleDateString(
                              "he-IL"
                            )}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border w-[14%]">
                      <div className="flex justify-center gap-3">
                        <button
                          title="ערוך"
                          onClick={() => handleEdit(product)}>
                          <Icon
                            icon="material-symbols:edit"
                            className="text-blue-600 text-xl"
                          />
                        </button>
                        <button
                          title="מחק"
                          onClick={() => handleDelete(product._id)}>
                          <Icon
                            icon="material-symbols:delete-outline"
                            className="text-red-600 text-xl"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden p-2 space-y-4">
          {filteredProducts.map((product) => {
            const firstImage = product.images?.[0];
            const discount = product.discounts?.find((d) => {
              const now = new Date();
              return new Date(d.startDate) <= now && now <= new Date(d.endDate);
            });
            const profit = product.price - (product.manufacturingCost || 0);

            return (
              <div
                key={product._id}
                className="border rounded-md shadow-sm p-3 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt="product"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 text-sm rounded">
                      אין תמונה
                    </div>
                  )}
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">
                      {product.name.he} / {product.name.en}
                    </div>
                    <div className="text-gray-600 text-xs">
                      מחיר: {product.price}₪ | רווח:{" "}
                      <span
                        className={
                          profit > 0 ? "text-green-600" : "text-red-600"
                        }>
                        {profit}₪
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      מלאי: {product.stock} |{" "}
                      {product.internationalShipping
                        ? "משלוח לחו״ל ✔"
                        : "ללא משלוח ✖"}
                    </div>
                    {discount && (
                      <div className="text-xs text-green-700 mt-1">
                        מבצע: {discount.percentage}% עד{" "}
                        {new Date(discount.endDate).toLocaleDateString("he-IL")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="text-blue-600"
                    onClick={() => handleEdit(product)}>
                    <Icon icon="material-symbols:edit" className="text-xl" />
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(product._id)}>
                    <Icon
                      icon="material-symbols:delete-outline"
                      className="text-xl"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
