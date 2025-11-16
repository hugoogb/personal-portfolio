import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project";
import { SectionCard } from "@/components/sections/SectionCard";
import { PROJECTS } from "../../../constants/projects.constants";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Project as ProjectType } from "@/types/project.types";
import { DEFAULTS } from "@/constants/strings.constants";

export const ProjectsSection = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setProjects(PROJECTS);
      setIsLoading(false);
    }, DEFAULTS.LOADING_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const projectsMapped = projects.map((project) => {
    return <Project key={project.id} {...project} desc={t(project.desc)} />;
  });

  return (
    <SectionCard
      id={t("nav.projects")}
      title={t("projects.title")}
      memoji="/memojis/image2.png"
    >
      <div className={styles.projectsWrapper}>
        {isLoading ? <LoadingSpinner /> : projectsMapped}
      </div>
    </SectionCard>
  );
};
