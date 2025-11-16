/**
 * String constants
 * Centralized string values to avoid magic strings throughout the codebase
 */

// Form status values
export const FORM_STATUS = {
    SUCCESS: 'Success',
    ERROR: 'Error',
} as const;

// Email validation regex
export const EMAIL_REGEX = /\S+@\S+\.\S+/;

// LocalStorage keys
export const STORAGE_KEYS = {
    COLOR: 'color',
} as const;

// Default values
export const DEFAULTS = {
    COLOR: '#3142db',
    LOADING_DELAY: 500, // milliseconds
} as const;

// Modal colors
export const MODAL_COLORS = {
    SUCCESS: 'green',
    ERROR: 'red',
} as const;

// Auto-complete values
export const AUTOCOMPLETE = {
    OFF: 'off',
    NAME: 'name',
} as const;

// Image alt text patterns
export const ALT_TEXT = {
    PROFILE: 'Memoji of Hugo GB',
    PROJECT: (name: string) => `${name} project preview`,
    SECTION: (title: string) => `${title} section memoji`,
} as const;

// Aria labels
export const ARIA_LABELS = {
    VIEW_PROJECT: (name: string) => `View ${name} project`,
    CLOSE_MODAL: 'Close modal',
} as const;

