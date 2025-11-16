import { SpeedInsights } from "@vercel/speed-insights/react";
import { createContext, useState, useCallback, useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import styles from "@/styles/modules/Layout.module.css";
import { useRouter } from "next/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ColorContextValue } from "@/types/common.types";
import { STORAGE_KEYS, DEFAULTS } from "@/constants/strings.constants";

export const ColorContext = createContext<ColorContextValue>({
  color: DEFAULTS.COLOR,
  setColor: () => {},
});

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [color, setColor] = useState<string>(() => {
    // Use function to initialize state from localStorage only on client
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.COLOR) || DEFAULTS.COLOR;
    }
    return DEFAULTS.COLOR;
  });

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    localStorage.setItem(STORAGE_KEYS.COLOR, newColor);
  }, []);

  const colorContextValue = useMemo<ColorContextValue>(
    () => ({
      color,
      setColor: handleColorChange,
    }),
    [color, handleColorChange]
  );

  return (
    <>
      <SpeedInsights route={router.pathname} />
      <I18nextProvider i18n={i18n}>
        <ColorContext.Provider value={colorContextValue}>
          <div className={styles.layout}>
            <Header />
            <div className={styles.layoutContent}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
            <Footer />
          </div>
        </ColorContext.Provider>
      </I18nextProvider>
    </>
  );
};
