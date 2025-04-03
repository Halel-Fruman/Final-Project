import { useTranslation } from "react-i18next";

const CategoryFilter = ({ categories, selectedCategories, setSelectedCategories }) => {
  const { i18n } = useTranslation();

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-2">
      {Array.isArray(categories) &&
        categories.map((cat) =>
          cat && cat._id ? (
            <label key={cat._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat._id)}
                onChange={() => toggleCategory(cat._id)}
              />
              <span>{cat.name?.[i18n.language] ?? "Unnamed"}</span>
            </label>
          ) : null
        )}
    </div>
  );
};

export default CategoryFilter;
