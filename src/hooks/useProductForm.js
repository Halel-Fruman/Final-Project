// File: src/hooks/useProductForm.js
import { useState, useEffect } from "react";

const initialFormState = {
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
};

const useProductForm = (editingProduct) => {
  const [newProduct, setNewProduct] = useState(initialFormState);

  useEffect(() => {
    if (editingProduct) {
      const discount = editingProduct.discounts?.[0];
      setNewProduct({
        nameEn: editingProduct.name?.en || "",
        nameHe: editingProduct.name?.he || "",
        price: editingProduct.price || "",
        stock: editingProduct.stock || "",
        manufacturingCost: editingProduct.manufacturingCost || "",
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

  const handleInputChange =
    (field, isNumber = false) =>
    (e) => {
      const value = isNumber ? Number(e.target.value) : e.target.value;
      setNewProduct((prev) => ({ ...prev, [field]: value }));
    };

  const handleVoiceInput = (field) => (value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureVoiceInput = (field) => (text) => {
    const split = field.includes("En")
      ? text.split(/comma|dot|semicolon|end/gi)
      : text.split(/סיים|פסיק|נקודה|,|\.|;/g);
    const features = split.map((s) => s.trim()).filter(Boolean);
    setNewProduct((prev) => ({ ...prev, [field]: features }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setNewProduct((prev) => {
      const updated = checked
        ? [...prev.selectedCategories, value]
        : prev.selectedCategories.filter((id) => id !== value);
      return { ...prev, selectedCategories: updated };
    });
  };

  const handleImageUrlAdd = () => {
    if (!newProduct.newImageUrl) return;
    setNewProduct((prev) => ({
      ...prev,
      images: [...prev.images, prev.newImageUrl],
      newImageUrl: "",
    }));
  };

  const handleImageRemove = (index) => {
    setNewProduct((prev) => {
      const images = [...prev.images];
      images.splice(index, 1);
      return { ...prev, images };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setNewProduct((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            `https://ilan-israel.co.il/api${data.imageUrl}`,
          ],
        }));
      } else {
        alert("שגיאה בהעלאת התמונה: " + (data.message || ""));
      }
    } catch (err) {
      alert("שגיאה בשרת בעת העלאה");
      console.error("Upload error:", err);
    }
  };

  return {
    newProduct,
    setNewProduct,
    handleInputChange,
    handleVoiceInput,
    handleFeatureVoiceInput,
    handleCategoryChange,
    handleImageUrlAdd,
    handleImageRemove,
    handleImageUpload,
  };
};

export default useProductForm;
