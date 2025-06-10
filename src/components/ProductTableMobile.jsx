// File: src/components/ProductTableMobile.jsx
import React from "react";
import { Icon } from "@iconify/react";

const ProductTableMobile = ({ products, handleEdit, handleDelete }) => {
  return (
    <div className="block md:hidden p-2 space-y-4">
      {(products || []).map((product) => {
        const firstImage = product.images?.[0];
        const discount = product.discounts?.find((d) => {
          const now = new Date();
          return new Date(d.startDate) <= now && now <= new Date(d.endDate);
        });
        const profit = product.price - (product.manufacturingCost || 0);

        return (
          <div key={product._id} className="border rounded-md shadow-sm p-3 bg-white">
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
                  מחיר: {product.price}₪ | רווח: <span className={profit > 0 ? "text-green-600" : "text-red-600"}>{profit}₪</span>
                </div>
                <div className="text-xs mt-1">
                  מלאי: {product.stock} | {product.internationalShipping ? "משלוח לחו״ל ✔" : "ללא משלוח ✖"}
                </div>
                {discount && (
                  <div className="text-xs text-green-700 mt-1">
                    מבצע: {discount.percentage}% עד {new Date(discount.endDate).toLocaleDateString("he-IL")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button className="text-blue-600" onClick={() => handleEdit(product)}>
                <Icon icon="material-symbols:edit" className="text-xl" />
              </button>
              <button className="text-red-600" onClick={() => handleDelete(product._id)}>
                <Icon icon="material-symbols:delete-outline" className="text-xl" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductTableMobile;
