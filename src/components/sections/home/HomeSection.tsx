import { useContext } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Home.module.css";
import stylesSection from "@/styles/modules/Section.module.css";
import { ColorContext } from "@/components/Layout";
import { HomeTitle } from "@/components/sections/home/HomeTitle";
import { ImageSwitcher } from "@/components/shared/ImageSwitcher";

export function HomeSection() {
  const { t } = useTranslation();
  const { color } = useContext(ColorContext);
  const memojis = ["/memojis/image3.png", "/memojis/image0.png"];

  return (
    <section id={t("nav.home")} className={stylesSection.section}>
      <div className={stylesSection.cardWrapper}>
        <div className={stylesSection.cardContainer}>
          <div className={stylesSection.sectionWrapper}>
            <div className={styles.headerContainer}>
              <div className={styles.nameHeaderTextContainer}>
                <HomeTitle />
              </div>
              <ImageSwitcher images={memojis} backgroundColor={color} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
