import  { useState, useEffect } from "react";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";
import { fetchWithTokenRefresh } from "../../utils/authHelpers.js";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameHe, setCategoryNameHe] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchWithTokenRefresh("/api/Category/");
        setCategories(await res.json());
      } catch (err) {
        showAlert("אירעה שגיאה בעת קבלת הקטגוריות", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryNameEn || !categoryNameHe) {
      showAlert("יש להזין שם קטגוריה גם בעברית וגם באנגלית.", "error");
      return;
    }

    try {
      const res = await fetchWithTokenRefresh("/api/Category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: { en: categoryNameEn, he: categoryNameHe },
        }),
      });

      if (!res.ok) throw new Error();
      const newCategory = await res.json();
      setCategories([...categories, newCategory]);
      showAlert("הקטגוריה נוספה בהצלחה!", "success");
      setCategoryNameEn("");
      setCategoryNameHe("");
    } catch {
      showAlert("אירעה שגיאה בעת הוספת הקטגוריה", "error");
    }
  };

  const handleDeleteCategory = (categoryId) => {
    showAlert(
      "האם אתה בטוח שברצונך למחוק את הקטגוריה?",
      "warning",
      async () => {
        try {
          const res = await fetchWithTokenRefresh(
            `/api/Category/${categoryId}`,
            {
              method: "DELETE",
            }
          );
          if (!res.ok) throw new Error();
          setCategories(categories.filter((cat) => cat._id !== categoryId));
          showAlert("הקטגוריה נמחקה בהצלחה!", "success");
        } catch {
          showAlert("אירעה שגיאה בעת מחיקת הקטגוריה", "error");
        }
      }
    );
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center mb-8 text-2xl font-bold">ניהול קטגוריות</h1>

      <div className="mb-4 flex lg:flex-row flex-col gap-2">
        <input
          type="text"
          aria-label="Category Name in English"
          className="flex border px-3 py-2"
          placeholder="שם קטגוריה באנגלית"
          value={categoryNameEn}
          onChange={(e) => setCategoryNameEn(e.target.value)}
        />
        <input
          type="text"
          className="flex border px-3 py-2"
          aria-label="Category Name in Hebrew"
          placeholder="שם קטגוריה בעברית"
          value={categoryNameHe}
          onChange={(e) => setCategoryNameHe(e.target.value)}
        />
        <button
          className="bg-primaryColor text-xl font-bold text-white px-4 py-2"
          onClick={handleAddCategory}
          aria-label="Add Category">
          <h2>הוסף קטגוריה</h2>
        </button>
      </div>

      <ul className="w-full">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b border-gray-300 py-7 animate-pulse">
                <div className="w-1/2 h-4 bg-gray-300 rounded" />
                <div className="w-6 h-6 bg-gray-300 rounded-full" />
              </li>
            ))
          : categories.map((category) => (
              <li
                key={category._id}
                className="flex justify-between items-center border-b border-gray-300 py-2">
                <span>
                  {category.name.en} / {category.name.he}
                </span>
                <button
                  className="bg-white text-deleteC px-2 py-2 rounded-full hover:bg-deleteC hover:text-white ring-2 ring-gray-200 hover:ring-deleteC transition duration-200"
                  onClick={() => handleDeleteCategory(category._id)}
                  aria-label="Delete Category">
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
