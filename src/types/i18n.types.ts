export type SupportedLocale = 'en' | 'es' | 'ca';

export interface LocaleResource {
  [key: string]: string | LocaleResource;
}

export interface I18nConfig {
  lng: SupportedLocale;
  fallbackLng: SupportedLocale;
  ns: string[];
  defaultNS: string;
  interpolation: {
    escapeValue: boolean;
  };
  react: {
    useSuspense: boolean;
  };
  resources?: {
    [key: string]: {
      [namespace: string]: any;
    };
  };
}

export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.about': string;
  'nav.projects': string;
  'nav.contact': string;

  // Home section
  'home.greeting': string;
  'home.name': string;
  'home.title': string;
  'home.description': string;

  // About section
  'about.title': string;
  'about.description': string;

  // Projects section
  'projects.title': string;
  'projects.formula1Showcase.description': string;
  'projects.autodetailinges.description': string;
  'projects.avatar-generator.description': string;

  // Contact section
  'contact.title': string;
  'contact.form.name': string;
  'contact.form.email': string;
  'contact.form.subject': string;
  'contact.form.message': string;
  'contact.form.send': string;

  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
}