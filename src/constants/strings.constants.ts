/**
 * String constants
 * Centralized string values to avoid magic strings throughout the codebase
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  COLOR: "color",
} as const;

// Contact details, shared by the Brief, the town and the structured data
export const CONTACT = {
  EMAIL: "hello@hugoogb.dev",
  GITHUB: "https://github.com/hugoogb",
  LINKEDIN: "https://www.linkedin.com/in/hugoogb/",
} as const;

// Image alt text patterns
export const ALT_TEXT = {
  PROFILE: "Hugo García Benjumea",
  PROJECT: (name: string) => `Screenshot of ${name}`,
  SECTION: (title: string) => `${title} section`,
} as const;
