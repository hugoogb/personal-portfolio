/**
 * Design system constants
 * Centralized values for spacing, breakpoints, sizes, and other design tokens
 */

// Breakpoints (mobile-first approach)
export const BREAKPOINTS = {
    mobile: '720px',
    tablet: '920px',
    desktop: '1024px',
    wide: '1440px',
} as const;

// Spacing scale (in rem units for better accessibility)
export const SPACING = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    base: '1rem',     // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
    '4xl': '3.5rem',  // 56px
    '5xl': '5rem',    // 80px
} as const;

// Font sizes
export const FONT_SIZES = {
    xs: '0.875rem',   // 14px
    sm: '1rem',       // 16px
    base: '1.125rem', // 18px
    md: '1.375rem',   // 22px
    lg: '2rem',       // 32px
    xl: '2.25rem',    // 36px
    '2xl': '3rem',    // 48px
    '3xl': '3.5rem',  // 56px
    '4xl': '4.5rem',  // 72px
} as const;

// Border radius
export const BORDER_RADIUS = {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '32px',
    '2xl': '64px',
    full: '50%',
} as const;

// Icon sizes
export const ICON_SIZES = {
    sm: 20,
    md: 24,
    lg: 48,
    xl: 75,
} as const;

// Image sizes
export const IMAGE_SIZES = {
    profile: {
        mobile: 250,
        tablet: 300,
        desktop: 375,
    },
    memoji: {
        width: 75,
        height: 75,
    },
} as const;

// Z-index layers
export const Z_INDEX = {
    base: 1,
    dropdown: 100,
    sticky: 200,
    overlay: 500,
    modal: 1000,
    tooltip: 1100,
} as const;

// Transitions
export const TRANSITIONS = {
    fast: '0.15s ease-out',
    base: '0.3s ease-in-out',
    slow: '0.5s ease',
} as const;

// Layout dimensions
export const LAYOUT = {
    headerHeight: '152px',
    footerHeight: '128px',
    maxContentWidth: '1200px',
    cardPadding: {
        mobile: '1rem',
        tablet: '2rem',
        desktop: '3rem',
    },
    cardMargin: {
        mobile: '1rem',
        tablet: '2.5rem',
        desktop: '5rem',
    },
} as const;

// Form dimensions
export const FORM = {
    width: {
        mobile: '300px',
        desktop: '500px',
    },
    textareaHeight: '100px',
    inputPadding: '1rem',
} as const;

// Project card dimensions
export const PROJECT_CARD = {
    maxWidth: '500px',
    imageAspectRatio: '16 / 9',
    imageOpacity: {
        default: 0.85,
        hover: 1,
    },
} as const;

// Animation values
export const ANIMATIONS = {
    rotate: {
        hover: '90deg',
    },
    scale: {
        hover: 1.03,
        imageHover: 1.05,
    },
} as const;

