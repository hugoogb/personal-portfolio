import type { FC } from 'react';
import { createContext, useMemo, Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { I18nextProvider } from 'react-i18next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import i18n from '../../i18n';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ColorContextValue, LayoutProps } from '@/types/common.types';

import styles from '@/styles/modules/Layout.module.css';

// Lazy load components that are not immediately visible
const Header = dynamic(() => import('@/components/header/Header').then(mod => ({ default: mod.Header })), {
  loading: () => <div style={{ height: '80px' }} />, // Prevent layout shift
});

const Footer = dynamic(() => import('@/components/footer/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div style={{ height: '200px' }} />, // Prevent layout shift
});

// Color context with proper typing
export const ColorContext = createContext<ColorContextValue>({
  color: '#3142db',
  setColor: () => {}
});

export const LayoutOptimized: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  
  // Use optimized localStorage hook
  const [color, setColor] = useLocalStorage<string>('color', '#3142db');
  
  // Memoize context value to prevent unnecessary re-renders
  const colorContextValue = useMemo<ColorContextValue>(() => ({
    color,
    setColor,
  }), [color, setColor]);

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <div className={styles.layout}>
      <Suspense fallback={<div style={{ height: '80px' }} />}>
        <Header />
      </Suspense>
      
      <main className={styles.layoutContent}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      <Suspense fallback={<div style={{ height: '200px' }} />}>
        <Footer />
      </Suspense>
    </div>
  ), [children]);

  return (
    <>
      <SpeedInsights route={router.pathname} />
      <I18nextProvider i18n={i18n}>
        <ColorContext.Provider value={colorContextValue}>
          {mainContent}
        </ColorContext.Provider>
      </I18nextProvider>
    </>
  );
};