/**
 * String constants
 * Centralized string values to avoid magic strings throughout the codebase
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  COLOR: "color",
  DARK_MODE: "isDarkMode",
} as const;

// Contact details, shared by the contact section and the command palette
export const CONTACT = {
  EMAIL: "hugogaben8.02@gmail.com",
  GITHUB: "https://github.com/hugoogb",
  LINKEDIN: "https://www.linkedin.com/in/hugoogb/",
} as const;

// Image alt text patterns
export const ALT_TEXT = {
  PROFILE: "Hugo García Benjumea",
  PROJECT: (name: string) => `${name} project preview`,
  SECTION: (title: string) => `${title} section`,
} as const;
