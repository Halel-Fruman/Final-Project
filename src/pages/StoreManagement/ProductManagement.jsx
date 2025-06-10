// File: ProductManagement.jsx
import React from "react";
import ProductForm from "../../components/ProductForm";
import ProductTable from "../../components/ProductTable";
import ProductTableMobile from "../../components/ProductTableMobile";
import useProductManagement from "../../hooks/useProductManagement";
import exportToExcel from "../../utils/exportToExcel";
import { Icon } from "@iconify/react";
import { fi } from "date-fns/locale";

const ProductManagement = ({ storeId, autoOpenAddForm = false, autofill = {} }) => {
  const {
    isAddingProduct,
    editingProduct,
    categories,
    products,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSaveProduct,
    setIsAddingProduct,
    searchQuery,
    setSearchQuery,
    handleExportProducts,
    filteredProducts,
  } = useProductManagement(storeId, autoOpenAddForm, autofill);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 text-center">ניהול מוצרים</h1>

      <div className="mb-4 mr-4 flex justify">
        <button
          className="bg-blue-700 font-bold text-xl ml-4 text-white px-4 py-2 rounded-full"
          onClick={() => setIsAddingProduct(true)}>
          <h2>הוסף מוצר</h2>
        </button>

        <div className="flex w-full max-w-md gap-2">
          <input
            type="text"
            placeholder="חפש מוצר לפי שם..."
            className="flex-grow p-2 border rounded-full shadow-sm text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleExportProducts}
          className="bg-green-600 mx-4 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow"
          title="ייצוא לאקסל">
          ייצוא לאקסל
        </button>
      </div>

      {isAddingProduct && (
        <ProductForm
          editingProduct={editingProduct}
          categories={categories}
          onCancel={handleCancel}
          onSave={handleSaveProduct}
        />
      )}

      <div className="border rounded-lg shadow overflow-hidden">
        <div className="hidden md:block">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div className="block md:hidden">
          <ProductTableMobile
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
