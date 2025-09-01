// File: ProductManagement.jsx

import ProductForm from "../../components/Product/ProductForm";
import ProductTable from "../../components/Product/ProductTable";
import ProductTableMobile from "../../components/Product/ProductTableMobile";
import useProductManagement from "../../hooks/useProductManagement";
import { Icon } from "@iconify/react";
import { fi } from "date-fns/locale";

// This component manages the product management functionality for a store
// It includes adding, editing, deleting products, searching, and exporting to Excel
const ProductManagement = ({
  storeId,
  autoOpenAddForm = false,
  autofill = {},
}) => {
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
    handleAdd,
    searchQuery,
    setSearchQuery,
    handleExportProducts,
    filteredProducts,
    formMode,
  } = useProductManagement(storeId, autoOpenAddForm, autofill);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 text-center">ניהול מוצרים</h1>

      <div className=" gap-3 mb-4 flex flex-col md:flex-row md:items-center">
        <div className="flex flex-row gap-2">
          <button
            onClick={handleAdd}
            className=" md:w-auto bg-blue-700 text-white md:font-bold md:text-xl px-4 py-2 rounded-full">
            הוסף מוצר
          </button>

        <button
          onClick={handleExportProducts}
          className=" md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow">
          ייצוא לאקסל
        </button>
        </div>

        <input
          type="text"
          placeholder="חפש מוצר לפי שם..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="  p-2 border rounded-full shadow-sm text-right"
        />
      </div>

      {isAddingProduct && (
        <ProductForm
          mode={formMode}
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
