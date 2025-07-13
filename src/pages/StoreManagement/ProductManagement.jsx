// File: ProductManagement.jsx

import ProductForm from "../../components/Product/ProductForm";
import ProductTable from "../../components/Product/ProductTable";
import ProductTableMobile from "../../components/Product/ProductTableMobile";
import useProductManagement from "../../hooks/useProductManagement";
import { Icon } from "@iconify/react";
import { fi } from "date-fns/locale";

// This component manages the product management functionality for a store
// It includes adding, editing, deleting products, searching, and exporting to Excel
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

      <div className="mb-4 mr-4 flex justify">
        <button
          className="bg-blue-700 font-bold text-xl ml-4 text-white px-4 py-2 rounded-full"
          onClick={handleAdd}>
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
