import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { SupportedLocale, I18nConfig } from "@/types/i18n.types";

// Initialize i18n with typed configuration
const config: I18nConfig = {
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
};

i18n
  .use(initReactI18next)
  .init(config);

// Dynamically load translations
export const loadLocale = async (locale: SupportedLocale): Promise<boolean> => {
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

// Get saved language with proper typing
const getSavedLanguage = (): SupportedLocale => {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem('language') as SupportedLocale | null;
  return saved && ['en', 'es', 'ca'].includes(saved) ? saved : 'en';
};

// Initial load of default language
if (typeof window !== 'undefined') {
  const savedLanguage = getSavedLanguage();
  loadLocale(savedLanguage).then(() => {
    i18n.changeLanguage(savedLanguage);
  });
} else {
  loadLocale('en');
}

export default i18n;
