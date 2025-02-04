import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";

// CategoryManagement component
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]); // categories state
  const [categoryNameEn, setCategoryNameEn] = useState(""); // categoryNameEn state
  const [categoryNameHe, setCategoryNameHe] = useState(""); // categoryNameHe state
  const { showAlert } = useAlert(); // useAlert hook

  // useEffect hook to fetch categories from the server
  useEffect(() => {
    axios
      .get("http://localhost:5000/Category/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת קבלת הקטגוריות", "error");
      });
  }, []);

  // handleAddCategory function to add a new category
  const handleAddCategory = () => {
    // check if the category name is empty in English or Hebrew
    if (!categoryNameEn || !categoryNameHe) {
      showAlert("יש להזין שם קטגוריה גם בעברית וגם באנגלית.", "error");
      return;
    }
    // send a POST request to the server to add a new category
    axios
      .post("http://localhost:5000/Category/", {
        name: { en: categoryNameEn, he: categoryNameHe },
      })
      .then((res) => {
        setCategories([...categories, res.data]);
        showAlert("הקטגוריה נוספה בהצלחה!", "success");
        setCategoryNameEn("");
        setCategoryNameHe("");
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת הוספת הקטגוריה", "error");
      });
  };

  // handleDeleteCategory function to delete a category
  const handleDeleteCategory = (categoryId) => {
    showAlert("האם אתה בטוח שברצונך למחוק את הקטגוריה?", "warning", () => {
      // send a DELETE request to the server to delete the category
      axios
        .delete(`http://localhost:5000/Category/${categoryId}`)
        .then(() => {
          setCategories(
            categories.filter((category) => category._id !== categoryId)
          );
          showAlert("הקטגוריה נמחקה בהצלחה!", "success");
        })
        .catch((err) => {
          console.log(err);
          showAlert("אירעה שגיאה בעת מחיקת הקטגוריה", "error");
        });
    });
  };

  // return the CategoryManagement component
  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center mb-8 text-2xl font-bold">ניהול קטגוריות</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="border px-3 py-2"
          placeholder="שם קטגוריה באנגלית"
          value={categoryNameEn}
          onChange={(e) => setCategoryNameEn(e.target.value)}
        />
        <input
          type="text"
          className="border px-3 py-2"
          placeholder="שם קטגוריה בעברית"
          value={categoryNameHe}
          onChange={(e) => setCategoryNameHe(e.target.value)}
        />
        <button
          className="bg-primaryColor text-white px-4 py-2"
          onClick={handleAddCategory}>
          הוסף קטגוריה
        </button>
      </div>
      <ul className="w-full">
        {categories.map((category) => (
          <li
            key={category._id}
            className="flex justify-between items-center border-b border-gray-300 py-2">
            <span>
              {category.name.en} / {category.name.he}
            </span>
            <button
              className="bg-white text-deleteC px-2 py-2 rounded-full hover:bg-deleteC hover:text-white ring-2 ring-gray-200 hover:ring-deleteC transition duration-200"
              onClick={() => handleDeleteCategory(category._id)}>
              <Icon
                icon="material-symbols:delete-outline"
                width="24"
                height="24"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManagement;
