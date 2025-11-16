import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { SupportedLocale, I18nConfig } from "@/types/i18n.types";
import enTranslations from "./i18n/en.json";

// Get saved language with proper typing
const getSavedLanguage = (): SupportedLocale => {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('language') as SupportedLocale | null;
  return saved && ['en', 'es', 'ca'].includes(saved) ? saved : 'en';
};

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

// Initialize i18n with typed configuration
// Always start with 'en' to ensure server/client match, then update on client
const config: I18nConfig = {
  lng: 'en', // Always start with English for SSR consistency
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources: {
    en: {
      common: enTranslations,
    },
  },
};

i18n
  .use(initReactI18next)
  .init(config);

// On client, update to saved language after initialization
// Use requestAnimationFrame to ensure this happens after initial render
if (typeof window !== 'undefined') {
  // Wait for next tick to ensure hydration is complete
  requestAnimationFrame(() => {
    const savedLanguage = getSavedLanguage();
    if (savedLanguage !== 'en') {
      // Load and switch to saved language
      loadLocale(savedLanguage).then(() => {
        i18n.changeLanguage(savedLanguage);
      });
    }
  });
}

export default i18n;
