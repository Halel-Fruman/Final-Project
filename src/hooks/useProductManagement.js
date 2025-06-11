// File: src/hooks/useProductManagement.js
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertDialog";
import exportToExcel from "../utils/exportToExcel";
import e from "cors";


const useProductManagement = (
  storeId,
  autoOpenAddForm = false,
  autofill = {}
) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(autoOpenAddForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autofillPayload, setAutofillPayload] = useState(null);
  const [pendingEditRequest, setPendingEditRequest] = useState(null);
  const [pendingAutofillPayload, setPendingAutofillPayload] = useState(null);
  const [pendingEditFields, setPendingEditFields] = useState(null);
  const isAddingProductRef = useRef(isAddingProduct);
  const { showAlert } = useAlert();

  // Map the autofill payload to the expected product structure
  useEffect(() => {
    isAddingProductRef.current = isAddingProduct;
  }, [isAddingProduct]);

  // Fetch products and categories when storeId changes or on mount
  useEffect(() => {
    if (!storeId) return;

    axios
      .get(`/api/products/by-store?store=${storeId}`)
      .then((res) => setProducts(res.data))
      .catch(() => showAlert("אירעה שגיאה בעת קבלת המוצרים", "error"));

    axios
      .get(`/api/Category`)
      .then((res) => setCategories(res.data))
      .catch(() => showAlert("אירעה שגיאה בעת קבלת הקטגוריות", "error"));
  }, [storeId]);

  // Handle auto-open add product form
  useEffect(() => {
    const handleOpenAdd = () => {
      setIsAddingProduct(true);
      setEditingProduct(null);
    };
    window.addEventListener("openAddProduct", handleOpenAdd);
    return () => window.removeEventListener("openAddProduct", handleOpenAdd);
  }, []);

  // Handle autofill payload from external sources
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

  // Handle pending autofill payload when adding a product
  useEffect(() => {
    if (isAddingProduct && autofillPayload) {
      const mapped = mapPayloadToNewProduct(autofillPayload);
      setEditingProduct((prev) => ({ ...prev, ...mapped }));
      setAutofillPayload(null);
    }
  }, [isAddingProduct, autofillPayload]);

  // Handle pending autofill payload when adding a product
  useEffect(() => {
    if (pendingAutofillPayload && isAddingProduct) {
      const mapped = mapPayloadToNewProduct(pendingAutofillPayload);
      setEditingProduct((prev) => ({ ...prev, ...mapped }));
      setPendingAutofillPayload(null);
    }
  }, [isAddingProduct, pendingAutofillPayload]);

  // Handle pending edit fields when editing a product
  useEffect(() => {
    const handleEditProductForm = (e) => {
      const { productId } = e.detail;
      if (productId) {
        const productToEdit = products.find((p) => p._id === productId);
        if (productToEdit) {
          setEditingProduct(productToEdit);
          setIsAddingProduct(true);
        } else {
          showAlert("⚠️ לא נמצא מוצר עם המזהה המבוקש", "error");
        }
      }
    };
    window.addEventListener("openEditProductForm", handleEditProductForm);
    return () =>
      window.removeEventListener("openEditProductForm", handleEditProductForm);
  }, [products]);

  // Handle pending edit request from external sources
  // This is used to open the edit form when a product name is provided
  // and the product is found in the list of products
  useEffect(() => {
    if (pendingEditRequest && products.length > 0) {
      const { productName } = pendingEditRequest;
      const normalized = productName.trim().toLowerCase();
      const found = products.find((product) => {
        const nameHe = product.name?.he?.toLowerCase() || "";
        const nameEn = product.name?.en?.toLowerCase() || "";
        return nameHe.includes(normalized) || nameEn.includes(normalized);
      });
      if (found) {
        setEditProductId(found._id);
        setEditingProduct(found);
        window.dispatchEvent(
          new CustomEvent("openEditProductForm", {
            detail: { productId: found._id },
          })
        );
        setPendingEditRequest(null);
      } else {
        showAlert("❌ לא נמצא מוצר עם השם שסופק", "error");
        setPendingEditRequest(null);
      }
    }
  }, [pendingEditRequest, products]);

  // Handle pending edit request from external sources
  // This is used to open the edit form when a product name is provided
  useEffect(() => {
    const handleEditEvent = (e) => {
      setPendingEditRequest(e.detail);
    };
    window.addEventListener("openEditProduct", handleEditEvent);
    return () => window.removeEventListener("openEditProduct", handleEditEvent);
  }, []);

  // Handle pending edit fields when editing a product

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
  };


  // Handle delete product action
  // This function shows a confirmation alert before deleting a product
  const handleDelete = (productId) => {
    if (
      showAlert(
        "האם אתה בטוח שברצונך למחוק את המוצר?",
        "warning",

        () => {
          axios
            .delete(`/api/products/${storeId}/${productId}`)
            .then(() => {
              setProducts((prev) => prev.filter((p) => p._id !== productId));
              showAlert("המוצר נמחק בהצלחה", "success");
            })
            .catch(() => {
              showAlert("אירעה שגיאה במחיקת המוצר", "error");
            });
        },
        () => {}
      )
    ) {
    }
  };

  // Handle cancel action when adding or editing a product
  // This function shows a confirmation alert before canceling the action
  const handleCancel = () => {
    showAlert(
      "האם אתה בטוח שברצונך לבטל?",
      "warning",
      () => {
        setIsAddingProduct(false);
        setEditingProduct(null);
      },
      () => {}
    );
  };

  // Handle save product action
  // This function validates the product data and sends it to the server
  // If the product is being edited, it updates the existing product
  // If a new product is being added, it creates a new product
  // It also handles discount validation and shows appropriate alerts
  // If the product data is valid, it sends the data to the server
  const handleSaveProduct = (newProduct) => {
    newProduct = mapPayloadToNewProduct(newProduct);
    if (
      !newProduct.name?.en ||
      !newProduct.name?.he ||
      !newProduct.price ||
      newProduct.selectedCategories.length === 0
    ) {
      console.error("Missing required fields:", newProduct);
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
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      manufacturingCost: Number(newProduct.manufacturingCost),
      highlight: newProduct.highlight,
      description: newProduct.description,
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
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data : p))
          );
        } else {
          setProducts((prev) => [...prev, res.data]);
        }
        setIsAddingProduct(false);
        setEditingProduct(null);
        showAlert(
          editingProduct ? "המוצר עודכן בהצלחה!" : "המוצר נוסף בהצלחה!",
          "success"
        );
      })
      .catch(() => showAlert("אירעה שגיאה בשמירת המוצר", "error"));
  };

  // Handle export products action
  // This function exports the products to an Excel file
  const handleExportProducts = () => {
    exportToExcel(products);
    showAlert("המוצרים ייצאו לקובץ Excel", "success");
  };

  const filteredProducts = products.filter((product) => {
    const nameHe = product.name?.he?.toLowerCase() || "";
    const nameEn = product.name?.en?.toLowerCase() || "";
    return (
      nameHe.includes(searchQuery.toLowerCase()) ||
      nameEn.includes(searchQuery.toLowerCase())
    );
  });

  // Map the payload to the expected product structure
  const mapPayloadToNewProduct = (payload) => ({
    name: {
      en: payload.nameEn || "",
      he: payload.nameHe || "",
    },
    description: {
      en: payload.descriptionEn || "",
      he: payload.descriptionHe || "",
    },
    price: payload.price ?? "",
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
  });


  return {
    products,
    categories,
    isAddingProduct,
    setIsAddingProduct,
    editingProduct,
    setEditingProduct,
    editProductId,
    setEditProductId,
    searchQuery,
    setSearchQuery,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSaveProduct,
    handleExportProducts,
    filteredProducts,
  };
};

export default useProductManagement;
