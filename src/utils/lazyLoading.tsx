import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * Higher-order component for lazy loading with custom fallback
 */
export function withLazyLoading<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

/**
 * Utility for creating lazy-loaded sections with intersection observer
 */
export function createLazySection<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
) {
  return withLazyLoading(importFunc, fallback);
}