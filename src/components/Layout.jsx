import { SpeedInsights } from "@vercel/speed-insights/react";
import { createContext, useState, useCallback, useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.js";
import { Header } from "@/components/header/Header.jsx";
import { Footer } from "@/components/footer/Footer.jsx";
import styles from "@/styles/modules/Layout.module.css";
import { useRouter } from "next/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const ColorContext = createContext({
  color: "#3142db",
  setColor: () => {}
});

export const Layout = ({ children }) => {
  const router = useRouter();
  const [color, setColor] = useState(() => {
    // Use function to initialize state from localStorage only on client
    if (typeof window !== 'undefined') {
      return localStorage.getItem('color') || "#3142db";
    }
    return "#3142db";
  });
  
  const handleColorChange = useCallback((newColor) => {
    setColor(newColor);
    localStorage.setItem('color', newColor);
  }, []);
  
  const colorContextValue = useMemo(() => ({
    color,
    setColor: handleColorChange
  }), [color, handleColorChange]);

  return (
    <>
      <SpeedInsights route={router.pathname} />
      <I18nextProvider i18n={i18n}>
        <ColorContext.Provider value={colorContextValue}>
          <div className={styles.layout}>
            <Header />
            <div className={styles.layoutContent}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
            <Footer />
          </div>
        </ColorContext.Provider>
      </I18nextProvider>
    </>
  );
};
