import type { FC } from 'react';
import { useContext, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Header.module.css";
import { ColorContext } from "@/components/Layout";
import { IconDownload } from "@tabler/icons-react";

export const ButtonCV: FC = () => {
  const { t, i18n } = useTranslation();

  const lang = i18n.resolvedLanguage || 'en';
  const fileName = `CV-${lang}.pdf`;
  const downloadUrl = `/api/download?fileName=${fileName}&language=${lang}`;

  const { color } = useContext(ColorContext);

  const elementRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    try {
      const bgColor = getComputedStyle(element).backgroundColor;
      const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      
      if (rgbMatch) {
        const red = parseInt(rgbMatch[1], 10);
        const green = parseInt(rgbMatch[2], 10);
        const blue = parseInt(rgbMatch[3], 10);
        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

        element.style.color = luminance > 0.5 ? "black" : "white";
      }
    } catch (error) {
      console.warn('Error calculating button text color:', error);
      // Fallback to white text
      element.style.color = "white";
    }
  }, [color]);

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      ref={elementRef}
      onClick={handleDownload}
      style={{ backgroundColor: color }}
      className={`button ${styles.buttonCV}`}
    >
      {t("nav.downloadButton")}
      <IconDownload size={18} className={styles.iconDownload} />
    </button>
  );
};
