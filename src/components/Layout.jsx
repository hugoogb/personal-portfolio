import { SpeedInsights } from "@vercel/speed-insights/react";
import { createContext, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.js";
import { Header } from "@/components/header/Header.jsx";
import { Footer } from "@/components/footer/Footer.jsx";
import styles from "@/styles/modules/Layout.module.css";
import { useRouter } from "next/router";

export const ColorContext = createContext("#3142db");

export const Layout = ({ children }) => {
  const router = useRouter();
  const [color, setColor] = useState("#3142db");

  return (
    <>
      <SpeedInsights route={router.pathname} />
      <I18nextProvider i18n={i18n}>
        <ColorContext.Provider value={color}>
          <div className={styles.layout}>
            <Header setColor={setColor}></Header>
            <div className={styles.layoutContent}>{children}</div>
            <Footer></Footer>
          </div>
        </ColorContext.Provider>
      </I18nextProvider>
    </>
  );
};
