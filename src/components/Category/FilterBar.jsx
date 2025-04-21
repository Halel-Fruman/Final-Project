import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";

const FilterBar = ({
  categories,
  stores,
  selectedCategories,
  setSelectedCategories,
  selectedStores,
  setSelectedStores,
  isOnSaleOnly,
  setIsOnSaleOnly,
}) => {
  const { i18n, t } = useTranslation();

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedStores([]);
    setIsOnSaleOnly(false);
  };

  const hasFilters =
    selectedCategories.length > 0 || selectedStores.length > 0 || isOnSaleOnly;

  const FilterDropdown = ({ label, options, selected, onChange }) => {
    const toggleOption = (id) => {
      onChange(
        selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
      );
    };

    return (
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          aria-haspopup="true"
          aria-expanded="true">
          {label}
          {selected.length > 0 && (
            <span className="ml-2 mr-2 rounded bg-gray-200 px-1 text-xs">
              {selected.length}
            </span>
          )}
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            className="absolute z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2 max-h-64 overflow-y-auto"
            role="menu">
            {options.map((opt) => {
              const inputId = `filter-${label}-${opt.id}`;
              return (
                <Menu.Item key={opt.id} as="div" role="none">
                  <div className="flex items-center px-2 py-1 hover:bg-gray-100 rounded">
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={selected.includes(opt.id)}
                      onChange={() => toggleOption(opt.id)}
                      className="mr-2"
                      aria-checked={selected.includes(opt.id)}
                    />
                    <label htmlFor={inputId} className="cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  return (
    <div
      className="divide-y bg-gray-100 rounded-lg px-4 py-3 shadow mb-6 w-full mx-auto"
      role="region"
      aria-label={t("filters")}>
      {/* Dropdowns row */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <FilterDropdown
          label={t("category")}
          options={categories.map((c) => ({
            id: c._id,
            label: c.name[i18n.language],
          }))}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
        <FilterDropdown
          label={t("store")}
          options={stores.map((s) => ({
            id: s.id,
            label: s.name,
          }))}
          selected={selectedStores}
          onChange={setSelectedStores}
        />

        {/* On Sale filter */}
        <div className="flex items-center">
          <input
            id="filter-sale"
            type="checkbox"
            checked={isOnSaleOnly}
            onChange={(e) => setIsOnSaleOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="filter-sale" className="text-sm text-gray-700 mr-2">
            {t("on_sale_only")}
          </label>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-700 underline hover:text-primaryColor"
            aria-label={t("clear_filters")}>
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Selected filters as tags */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          <span className="text-gray-700 font-medium">{t("filters")}:</span>

          {selectedCategories.map((id) => {
            const cat = categories.find((c) => c._id === id);
            return (
              <span
                key={id}
                className="bg-white border rounded px-2 py-1 text-sm flex items-center">
                {cat?.name?.[i18n.language]}
                <button
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.filter((x) => x !== id)
                    )
                  }
                  className="ml-1 text-gray-500 hover:text-red-500"
                  aria-label={`${t("remove_filter")} ${
                    cat?.name?.[i18n.language]
                  }`}>
                  ×
                </button>
              </span>
            );
          })}

          {selectedStores.map((id) => {
            const store = stores.find((s) => s.id === id);
            return (
              <span
                key={id}
                className="bg-white border rounded px-2 py-1 text-sm flex items-center">
                {store?.name}
                <button
                  onClick={() =>
                    setSelectedStores((prev) => prev.filter((x) => x !== id))
                  }
                  className="ml-1 text-gray-500 hover:text-red-500"
                  aria-label={`${t("remove_filter")} ${store?.name}`}>
                  ×
                </button>
              </span>
            );
          })}

          {isOnSaleOnly && (
            <span className="bg-white border rounded px-2 py-1 text-sm flex items-center">
              {t("on_sale_only")}
              <button
                onClick={() => setIsOnSaleOnly(false)}
                className="ml-1 text-gray-500 hover:text-red-500"
                aria-label={t("remove_filter") + " " + t("on_sale_only")}>
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
