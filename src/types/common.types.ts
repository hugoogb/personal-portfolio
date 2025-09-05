import { ReactNode } from 'react';

// Layout and component props
export interface LayoutProps {
  children: ReactNode;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

// Color context
export interface ColorContextValue {
  color: string;
  setColor: (color: string) => void;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

// Icon types
export type IconName = 
  | 'React'
  | 'Vue'
  | 'Nodejs'
  | 'Expressjs'
  | 'Astro'
  | 'npm'
  | 'pnpm'
  | 'TypeScript'
  | 'JavaScript'
  | 'HTML'
  | 'CSS'
  | 'Tailwind'
  | 'Bootstrap'
  | 'Sass'
  | 'Git'
  | 'GitHub'
  | 'Docker'
  | 'Figma'
  | 'Photoshop';

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Responsive breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation states
export type AnimationState = 'idle' | 'loading' | 'success' | 'error';