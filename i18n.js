import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./i18n/en.json";
import esTranslation from "./i18n/es.json";
import caTranslation from "./i18n/ca.json";

i18n.use(initReactI18next).init({
  fallbackLng: ["en", "es", "ca"],
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources: {
    en: {
      translation: enTranslation,
    },
    es: {
      translation: esTranslation,
    },
    ca: {
      translation: caTranslation,
    },
  },
});

export default i18n;
