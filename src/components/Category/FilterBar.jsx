import { Fragment, useState } from "react";
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
  inStockOnly,
  setInStockOnly,
  searchText,
  setSearchText,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // חדש

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedStores([]);
    setIsOnSaleOnly(false);
    setInStockOnly(false);
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedStores.length > 0 ||
    isOnSaleOnly ||
    inStockOnly ||
    searchText ||
    minPrice ||
    maxPrice;

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
          className="inline-flex items-end rounded-full border border-secondaryColor bg-primaryColor bg-opacity-30 px-4 py-2 text-sm font-medium text-black hover:bg-secondary shadow-sm"
          aria-haspopup="true"
          aria-expanded="true">
          {label}
          {selected.length > 0 && (
            <span className="ml-2 mr-2 rounded-full bg-secondaryColor bg-opacity-20 px-1 text-sm">
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
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <Menu.Items
            className="absolute z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-64 overflow-y-auto"
            role="menu">
            <div className="bg-secondaryColor bg-opacity-20 p-2">
              {options.map((opt) => {
                const inputId = `filter-${label}-${opt.id}`;
                return (
                  <Menu.Item key={opt.id} as="div" role="none">
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-secondaryColor hover:bg-opacity-20 rounded-full">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={selected.includes(opt.id)}
                        onChange={() => toggleOption(opt.id)}
                        className="mr-2 accent-primaryColor"
                        aria-checked={selected.includes(opt.id)}
                      />
                      <label htmlFor={inputId} className="cursor-pointer">
                        {opt.label}
                      </label>
                    </div>
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  return (
    <div className="bg-primaryColor bg-opacity-30 rounded-lg px-4 py-3 shadow mb-6 w-full mx-auto">
      {/* Toggle button for mobile */}
      <div className="sm:hidden flex justify-start mb-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-full shadow-md">
          {t("filters")}
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-600 text-white rounded-full">
              {[
                selectedCategories.length,
                selectedStores.length,
                isOnSaleOnly ? 1 : 0,
                inStockOnly ? 1 : 0,
                searchText ? 1 : 0,
                minPrice ? 1 : 0,
                maxPrice ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters section: hidden on mobile unless isOpen is true */}
      <div className={`${isOpen ? "block" : "hidden"} sm:block`}>
        <div className="flex flex-col  gap-y-4 sm:flex-wrap sm:flex-row sm:items-center sm:gap-4 mb-4">
          <div className="flex gap-2 mt-2">
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
          </div>

          <label className="flex items-center mt-4 gap-2">
            <input
              type="checkbox"
              checked={isOnSaleOnly}
              onChange={(e) => setIsOnSaleOnly(e.target.checked)}
              className="accent-primaryColor"
            />
            <span className="text-sm">{t("on_sale_only")}</span>
          </label>

          <label className="flex items-center mt-4 gap-2">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-primaryColor"
            />
            <span className="text-sm">{t("in_stock_only")}</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex flex-col w-full sm:w-24">
              <label
                htmlFor="min-price"
                className="text-xs font-medium text-gray-700">
                {t("min_price")}
              </label>
              <input
                type="number"
                id="min-price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-secondaryColor rounded-full px-2 py-1 text-sm w-full"
              />
            </div>

            <div className="flex flex-col w-full sm:w-24">
              <label
                htmlFor="max-price"
                className="text-xs font-medium text-gray-700">
                {t("max_price")}
              </label>
              <input
                type="number"
                id="max-price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-secondaryColor rounded-full px-2 py-1 text-sm w-full"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder={t("search")}
            className="w-full sm:w-auto border border-secondaryColor rounded-full mt-4 px-3 py-1 text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Selected filters summary */}
        {hasFilters && (
          <div className="mt-2 flex flex-wrap border-t border-secondaryColor pt-2 gap-2">
            {selectedCategories.map((id) => {
              const label = categories.find((c) => c._id === id)?.name?.[
                i18n.language
              ];
              return (
                <span
                  key={`cat-${id}`}
                  className="bg-primaryColor text-white text-sm rounded-full px-3 py-1">
                  {label}
                </span>
              );
            })}
            {selectedStores.map((id) => {
              const label = stores.find((s) => s.id === id)?.name;
              return (
                <span
                  key={`store-${id}`}
                  className="bg-secondaryColor text-white text-sm rounded-full px-3 py-1">
                  {label}
                </span>
              );
            })}
            {isOnSaleOnly && (
              <span className="bg-green-600 text-white text-sm rounded-full px-3 py-1">
                {t("on_sale_only")}
              </span>
            )}
            {inStockOnly && (
              <span className="bg-blue-600 text-white text-sm rounded-full px-3 py-1">
                {t("in_stock_only")}
              </span>
            )}
            {searchText && (
              <span className="bg-gray-600 text-white text-sm rounded-full px-3 py-1">
                {t("search")}: {searchText}
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="bg-purple-600 text-white text-sm rounded-full px-3 py-1">
                ₪{minPrice || 0} - ₪{maxPrice || "∞"}
              </span>
            )}
            <button
              onClick={clearAll}
              className="text-sm text-black underline hover:text-primaryColor mt-2 sm:mt-0">
              {t("clear_filters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
