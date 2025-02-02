import React from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Icon } from "@iconify/react";

// LanguageSelector component
const LanguageSelector = ({ changeLanguage, currentLanguage }) => {
  const languages = [
    { code: "en", label: "EN", icon: "twemoji:flag-for-flag-united-kingdom" },
    { code: "he", label: "HE", icon: "twemoji:flag-for-flag-israel" },
  ];
  // Find the current language
  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    // for the language selector
    <Popover className="relative">
      <PopoverButton className="flex items-center gap-2 px-4 py-2 text-sm  rounded bg-white-500 text-blue">
        <Icon icon={currentLang.icon} width="20" height="20" />
        {currentLang.label}
      </PopoverButton>

      {/* for the language options */}
      <PopoverPanel className="absolute z-50 mt-2 w-22 bg-white border border-gray-300 rounded shadow-lg">
        <div className="flex flex-col">
          {/*map through the languages array */}
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left ${
                currentLanguage === lang.code
                  ? "bg-blue-100 text-blue-500"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              {/*for the language icon */}
              <Icon icon={lang.icon} width="20" height="20" />
              {lang.label}
            </button>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
};

export default LanguageSelector;
