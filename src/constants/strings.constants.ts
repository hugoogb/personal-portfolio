/**
 * String constants
 * Centralized string values to avoid magic strings throughout the codebase
 */

// LocalStorage keys
export const STORAGE_KEYS = {
    COLOR: 'color',
} as const;

// Image alt text patterns
export const ALT_TEXT = {
    PROFILE: 'Hugo García Benjumea',
    PROJECT: (name: string) => `${name} project preview`,
    SECTION: (title: string) => `${title} section`,
} as const;
