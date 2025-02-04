import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";

// The ProductManagement component is a functional component that takes the storeId as a prop
const ProductManagement = ({ storeId }) => {
  const [products, setProducts] = useState([]); // The products state is used to store the products
  const [categories, setCategories] = useState([]); // The categories state is used to store the categories
  const [isAddingProduct, setIsAddingProduct] = useState(false); // The isAddingProduct state is used to determine if the user is adding a product
  const [newProduct, setNewProduct] = useState({
    // The newProduct state is used to store the new product data
    nameEn: "",
    nameHe: "",
    price: "",
    stock: "",
    descriptionEn: "",
    descriptionHe: "",
    selectedCategories: [], // For storing selected categories
  });
  const { showAlert } = useAlert();

  // Fetch products and categories on initial render or storeId change
  useEffect(() => {
    axios
      .get(`http://localhost:5000/products?store=${storeId}`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת קבלת המוצרים", "error");
      });

    axios
      .get(`http://localhost:5000/Category`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת קבלת הקטגוריות", "error");
      });
  }, [storeId]);

  // Function to add a new product
  const handleAddProduct = () => {
    if (
      !newProduct.nameEn ||
      !newProduct.nameHe ||
      !newProduct.price ||
      newProduct.selectedCategories.length === 0
    ) {
      showAlert("יש למלא את כל השדות החיוניים", "error");
      return;
    }

    axios
      .post("http://localhost:5000/products", {
        name: { en: newProduct.nameEn, he: newProduct.nameHe },
        price: newProduct.price,
        stock: newProduct.stock,
        description: {
          en: newProduct.descriptionEn,
          he: newProduct.descriptionHe,
        },
        categories: newProduct.selectedCategories, // Add selected categories to the product
        store: storeId,
      })
      .then((res) => {
        setProducts([...products, res.data]);
        setIsAddingProduct(false);
        showAlert("המוצר נוסף בהצלחה!", "success");
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת הוספת המוצר", "error");
      });
  };
  // Function to handle category change
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setNewProduct((prevProduct) => {
      let selectedCategories = [...prevProduct.selectedCategories];
      if (checked) {
        selectedCategories.push(value);
      } else {
        selectedCategories = selectedCategories.filter(
          (category) => category !== value
        );
      }
      return { ...prevProduct, selectedCategories };
    });
  };
  // Function to handle cancel
  const handleCancel = () => {
    showAlert(
      "האם אתה בטוח שברצונך לבטל?",
      "warning",
      () => {
        console.log("אושר");
        setIsAddingProduct(false); // Close the modal
      },
      () => {
        console.log("בוטל");
      }
    );
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center mb-8 text-2xl font-bold">ניהול מוצרים</h1>
      <button
        className="bg-primaryColor text-white px-4 py-2"
        onClick={() => setIsAddingProduct(true)}>
        הוסף מוצר
      </button>

      {/*  Modal */}
      {isAddingProduct && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2 max-w-lg max-h-[80vh]  overflow-y-auto ">
            <h2 className="text-3xl font-bold mb-4 text-center">הוסף מוצר</h2>

            <div className="mb-4">
              <label className="block mb-1">שם מוצר באנגלית</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.nameEn}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, nameEn: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">שם מוצר בעברית</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.nameHe}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, nameHe: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">מחיר</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">מלאי</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">תיאור באנגלית</label>
              <textarea
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.descriptionEn}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    descriptionEn: e.target.value,
                  })
                }></textarea>
            </div>

            <div className="mb-4">
              <label className="block mb-1">תיאור בעברית</label>
              <textarea
                className="w-full border px-3 py-2 rounded-md shadow-sm"
                value={newProduct.descriptionHe}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    descriptionHe: e.target.value,
                  })
                }></textarea>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">קטגוריות:</label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={category._id}
                      onChange={handleCategoryChange}
                      checked={newProduct.selectedCategories.includes(
                        category._id
                      )}
                      className="m-2"
                    />
                    <span>
                      {category.name.en} / {category.name.he}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-white text-gray-600 px-4 py-2 rounded-md shadow-md hover:bg-gray-300"
                onClick={handleCancel}>
                <Icon
                  icon="material-symbols:cancel-outline-rounded"
                  width="24"
                  height="24"
                />
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                onClick={handleAddProduct}>
                <Icon
                  icon="material-symbols:check-circle-outline-rounded"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <ul className="mt-5 border-t">
        {products.map((product) => (
          <li
            key={product._id}
            className="flex justify-between items-center border-b py-2">
            <span>
              {product.name.en} / {product.name.he} - {product.price}₪
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductManagement;
