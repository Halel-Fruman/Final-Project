import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng:'he', // Default language,
    fallbackLng: 'he',
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        translation: require('./locales/en.json'),
      },
      he: {
        translation: require('./locales/he.json'),
      },
    },
  });

export default i18n;
