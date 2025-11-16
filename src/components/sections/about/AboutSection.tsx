import { useContext } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/About.module.css";
import { ColorContext } from "@/components/Layout";
import { AboutIcons } from "@/components/sections/about/AboutIcons";
import { SectionCard } from "@/components/sections/SectionCard";
import Link from "next/link";
import {
  BACKEND_ICONS,
  FRONTEND_ICONS,
  TOOLS_ICONS,
} from "../../../constants/icons.constants";
import { ICON_SIZES } from "@/constants/design.constants";

export function AboutSection() {
  const { t } = useTranslation();

  const { color } = useContext(ColorContext);

  const mapIcons = (icons: typeof FRONTEND_ICONS) => {
    return icons.map((icon) => {
      return (
        <div key={icon.id} title={icon.name}>
          <icon.icon
            stroke={1.25}
            size={ICON_SIZES.lg}
            className={styles.aboutIcon}
          />
        </div>
      );
    });
  };

  const iconsFrontendMapped = mapIcons(FRONTEND_ICONS);
  const iconsBackendMapped = mapIcons(BACKEND_ICONS);
  const iconsToolsMapped = mapIcons(TOOLS_ICONS);

  return (
    <SectionCard title={t("about.title")} memoji="/memojis/image4.png">
      <div className={styles.aboutContainer}>
        <div className={styles.aboutTextContainer}>
          <p>
            {t("about.text.intro")}
            <span style={{ color: color }} className={styles.aboutTextName}>
              {t("about.text.name")}
            </span>
            {t("about.text.introSection")}
          </p>
          <p>{t("about.text.learningSection")}</p>
          <p>{t("about.text.finalSection")}</p>

          <Link href="/contact">
            <span
              className={styles.aboutTextContainerLink}
              style={{ color: color }}
            >
              {t("about.text.letsTalk")}
            </span>
          </Link>
        </div>
        <div className={styles.aboutImagesContainer}>
          <AboutIcons
            title={t("about.categories.frontend")}
            iconsMapped={iconsFrontendMapped}
            color={color}
          ></AboutIcons>
          <AboutIcons
            title={t("about.categories.backend")}
            iconsMapped={iconsBackendMapped}
            color={color}
          ></AboutIcons>
          <AboutIcons
            title={t("about.categories.tools")}
            iconsMapped={iconsToolsMapped}
            color={color}
          ></AboutIcons>
        </div>
      </div>
    </SectionCard>
  );
}
