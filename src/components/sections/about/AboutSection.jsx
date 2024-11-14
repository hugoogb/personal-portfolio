import { useContext } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/About.module.css";
import { ColorContext } from "@/components/Layout.jsx";
import { AboutIcons } from "@/components/sections/about/AboutIcons.jsx";
import memoji from "/public/memojis/image4.png";
import { SectionCard } from "@/components/sections/SectionCard.jsx";
import Link from "next/link";

export function AboutSection() {
  const { t } = useTranslation();

  const color = useContext(ColorContext);

  const iconsFrontend = [
    {
      id: 0,
      src: "/icons/html-5.svg",
      alt: "HTML",
    },
    {
      id: 1,
      src: "/icons/css3.svg",
      alt: "CSS3",
    },
    {
      id: 2,
      src: "/icons/javascript.svg",
      alt: "Javascript",
    },
    {
      id: 3,
      src: "/icons/typescript.svg",
      alt: "Typescript",
    },
    {
      id: 4,
      src: "/icons/astro.svg",
      alt: "Astro",
    },
    {
      id: 5,
      src: "/icons/reactjs.svg",
      alt: "Reactjs",
    },
    {
      id: 6,
      src: "/icons/vuejs.svg",
      alt: "Vuejs",
    },
    {
      id: 7,
      src: "/icons/angular.svg",
      alt: "Angular",
    },
  ];

  const iconsBackend = [
    {
      id: 0,
      src: "/icons/nextjs.svg",
      alt: "Nextjs",
    },
    {
      id: 1,
      src: "/icons/nodejs.svg",
      alt: "Nodejs",
    },
    {
      id: 2,
      src: "/icons/expressjs.svg",
      alt: "Expressjs",
    },
    {
      id: 3,
      src: "/icons/loopback.svg",
      alt: "Loopback",
    },
    {
      id: 4,
      src: "/icons/supabase.svg",
      alt: "Supabase",
    },
    {
      id: 5,
      src: "/icons/firebase.svg",
      alt: "Firebase",
    },
    {
      id: 6,
      src: "/icons/mongodb.svg",
      alt: "MongoDB",
    },
    {
      id: 7,
      src: "/icons/mysql.svg",
      alt: "MySql",
    },
  ];

  const iconsTools = [
    {
      id: 0,
      src: "/icons/npm.svg",
      alt: "Npm",
    },
    {
      id: 1,
      src: "/icons/git.svg",
      alt: "Git",
    },
    {
      id: 2,
      src: "/icons/github.svg",
      alt: "Github",
    },
    {
      id: 3,
      src: "/icons/bitbucket.svg",
      alt: "Bitbucket",
    },
    {
      id: 4,
      src: "/icons/jira.svg",
      alt: "Jira",
    },
    {
      id: 5,
      src: "/icons/vercel.svg",
      alt: "Vercel",
    },
  ];

  const mapIcons = (icons) => {
    return icons.map((icon) => {
      return (
        <div key={icon.id} title={icon.alt}>
          <Image
            src={icon.src}
            alt={icon.alt + " svg icon"}
            width={48}
            height={48}
            className={styles.aboutIcon}
          />
        </div>
      );
    });
  };

  const iconsFrontendMapped = mapIcons(iconsFrontend);
  const iconsBackendMapped = mapIcons(iconsBackend);
  const iconsToolsMapped = mapIcons(iconsTools);

  return (
    <SectionCard title={t("about.title")} memoji={memoji}>
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
