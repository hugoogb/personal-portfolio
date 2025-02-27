import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Initialize i18n with basic configuration
i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Dynamically load translations
export const loadLocale = async (locale) => {
  try {
    if (!i18n.hasResourceBundle(locale, 'common')) {
      const module = await import(`./i18n/${locale}.json`);
      i18n.addResourceBundle(locale, 'common', module.default);
    }
    return true;
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    return false;
  }
};

// Initial load of default language
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('language') || 'en';
  loadLocale(savedLanguage).then(() => {
    i18n.changeLanguage(savedLanguage);
  });
} else {
  loadLocale('en');
}

export default i18n;
