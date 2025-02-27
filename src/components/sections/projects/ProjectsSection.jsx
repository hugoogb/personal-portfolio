import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import styles from "@/styles/modules/Projects.module.css";
import { Project } from "@/components/sections/projects/Project.jsx";
import memoji from "/public/memojis/image2.png";
import { SectionCard } from "@/components/sections/SectionCard.jsx";
import { PROJECTS } from "../../../constants/projects.constants";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function ProjectsSection() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

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
      <div className={styles.projectsWrapper}>
        {isLoading ? <LoadingSpinner /> : projectsMapped}
      </div>
    </SectionCard>
  );
}
