import { useTranslation } from "react-i18next";
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project";
import memoji from "/public/memojis/image2.png";
import { SectionCard } from "@/components/sections/SectionCard";
import { PROJECTS } from "../../../constants/projects.constants";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Project as ProjectType } from "@/types/project.types";

export const ProjectsSection: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setProjects(PROJECTS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const projectsMapped = projects.map((project) => {
    return (
      <Project
        key={project.id}
        {...project}
        desc={t(project.desc)}
      />
    );
  });

  return (
    <SectionCard
      id={t("nav.projects")}
      title={t("projects.title")}
      memoji={memoji}
    >
      <div className={styles.projectsWrapper}>
        {isLoading ? <LoadingSpinner /> : projectsMapped}
      </div>
    </SectionCard>
  );
}
