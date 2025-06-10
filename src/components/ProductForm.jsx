// File: src/components/ProductForm.jsx
import React, { useState } from "react";
import VoiceInputButton from "./VoiceInputButton";
import useProductForm from "../hooks/useProductForm";

const ProductForm = ({ editingProduct, categories, onCancel, onSave }) => {
  const {
    newProduct,
    setNewProduct,
    handleInputChange,
    handleVoiceInput,
    handleFeatureVoiceInput,
    handleCategoryChange,
    handleImageUrlAdd,
    handleImageRemove,
    handleImageUpload,
  } = useProductForm(editingProduct);
  const [selectedFileName, setSelectedFileName] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {editingProduct ? "עריכת מוצר" : "הוסף מוצר"}
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-bold">שם בעברית</label>
            <div className="relative w-full">
              <input
                type="text"
                className="w-full border pr-14 pl-3 py-2 rounded-full shadow-sm"
                value={newProduct.nameHe}
                onChange={handleInputChange("nameHe")}
              />
              <VoiceInputButton
                lang="he-IL"
                onResult={handleVoiceInput("nameHe")}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-bold">שם באנגלית</label>
            <div className="relative">
              <input
                type="text"
                className="w-full border px-12 py-2 rounded-full shadow-sm"
                value={newProduct.nameEn}
                onChange={handleInputChange("nameEn")}
              />
              <VoiceInputButton
                lang="en-US"
                onResult={handleVoiceInput("nameEn")}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold">תיאור בעברית</label>
          <div className="relative">
            <textarea
              className="w-full border px-12 py-2 rounded-full shadow-sm"
              value={newProduct.descriptionHe}
              onChange={handleInputChange("descriptionHe")}
            />
            <VoiceInputButton
              lang="he-IL"
              onResult={handleVoiceInput("descriptionHe")}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">תיאור באנגלית</label>
          <div className="relative">
            <textarea
              className="w-full border px-12 py-2 rounded-full shadow-sm"
              value={newProduct.descriptionEn}
              onChange={handleInputChange("descriptionEn")}
            />
            <VoiceInputButton
              lang="en-US"
              onResult={handleVoiceInput("descriptionEn")}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-1">מאפיינים בעברית</label>
          <div className="relative">
            <textarea
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
              onResult={handleFeatureVoiceInput("highlightHe")}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">מאפיינים באנגלית</label>
          <div className="relative">
            <textarea
              className="w-full border px-10 py-2 rounded-full shadow-sm"
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
              onResult={handleFeatureVoiceInput("highlightEn")}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-bold">מחיר</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.price}
              onChange={handleInputChange("price", true)}
            />
          </div>
          <div>
            <label className="block mb-1 font-bold">עלות ייצור</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.manufacturingCost}
              onChange={handleInputChange("manufacturingCost", true)}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-bold">אחוז מבצע</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.discountPercentage}
              onChange={handleInputChange("discountPercentage", true)}
            />
          </div>
          <div>
            <label className="block mb-1 font-bold">תאריך התחלה</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.discountStart}
              onChange={handleInputChange("discountStart")}
            />
          </div>
          <div>
            <label className="block mb-1 font-bold">תאריך סיום</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.discountEnd}
              onChange={handleInputChange("discountEnd")}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-bold">מלאי</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-full"
              value={newProduct.stock}
              onChange={handleInputChange("stock", true)}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={newProduct.allowBackorder}
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
              type="checkbox"
              checked={newProduct.internationalShipping}
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

        <div className="mb-4">
          <label className="block mb-2 font-bold">קטגוריות:</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={category._id}
                  checked={newProduct.selectedCategories.includes(category._id)}
                  onChange={handleCategoryChange}
                />
                {category.name.he} / {category.name.en}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">תמונות המוצר</label>
          <div className="flex gap-2 mb-2 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="הדבק קישור לתמונה"
              className="flex-grow border px-3 py-2 rounded-full"
              value={newProduct.newImageUrl || ""}
              onChange={handleInputChange("newImageUrl")}
            />
            <button
              type="button"
              className="bg-white text-green-600 font-semibold text-base px-4 py-2 rounded-full border-2 border-green-500 shadow-sm hover:bg-green-50 hover:shadow-md hover:scale-105 transform transition duration-300 ease-in-out"
              onClick={handleImageUrlAdd}>
              הוסף קישור
            </button>
          </div>

          <div className="mb-2">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setSelectedFileName(e.target.files[0].name);
                  handleImageUpload(e);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-white text-green-600 font-semibold text-base px-4 py-2 rounded-full border-2 border-green-500 shadow-sm hover:bg-green-50 hover:shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
              בחר תמונה מהמחשב
            </label>
            {selectedFileName && (
              <div className="text-sm text-gray-600 mt-1">
                {selectedFileName}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {newProduct.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`image-${index}`}
                  className="w-24 h-24 object-cover rounded border"
                />
                <button
                  className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-tr rounded-bl"
                  onClick={() => handleImageRemove(index)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300"
            onClick={onCancel}>
            ביטול
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
            onClick={() => onSave(newProduct)}>
            {editingProduct ? "שמור שינויים" : "הוסף מוצר"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
