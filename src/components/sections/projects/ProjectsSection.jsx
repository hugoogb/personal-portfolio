import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project.jsx";
import memoji from "/public/memojis/image2.png";
import { SectionCard } from "@/components/sections/SectionCard.jsx";
import { PROJECTS } from "../../../constants/projects.constants";

export function ProjectsSection() {
  const { t } = useTranslation();

  const projectsMapped = PROJECTS.map((project) => {
    return (
      <Project
        key={project.id}
        name={project.name}
        desc={t(project.desc)}
        urlPreview={project.urlPreview}
        src={project.src}
        techStack={project.techStack}
        workInProgress={project.workInProgress}
        githubUrl={project.githubUrl}
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
