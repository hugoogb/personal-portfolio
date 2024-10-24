import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project.jsx";
import memoji from "/public/memojis/image2.png";
import { SectionCard } from "@/components/sections/SectionCard.jsx";
import Img_f1showcase from "/public/images/f1-showcase.png";
import Img_personalPortfolio from "/public/images/personal-portfolio.png";

export function ProjectsSection() {
  const { t } = useTranslation();

  const projects = [
    {
      id: 0,
      name: "Formula 1 Showcase",
      desc: t("projects.formula1Showcase.description"),
      urlPreview: "https://f1-showcase.vercel.app",
      src: Img_f1showcase,
    },
    {
      id: 1,
      name: "Personal portfolio",
      desc: t("projects.personalPortfolio.description"),
      urlPreview: "https://hugoogb.dev",
      src: Img_personalPortfolio,
    },
  ];

  const projectsMapped = projects.map((project) => {
    return (
      <Project
        key={project.id}
        name={project.name}
        desc={project.desc}
        urlPreview={project.urlPreview}
        src={project.src}
      ></Project>
    );
  });

  return (
    <SectionCard
      id={t("nav.projects")}
      title={t("projects.title")}
      memoji={memoji}
    >
      <div className={styles.projectsWrapper}>{projectsMapped}</div>
    </SectionCard>
  );
}
