import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";
import { mapTechStackToIcons } from "@/utils/iconsTechStackMapper";
import {
  BACKEND_ICONS,
  FRONTEND_ICONS,
  TOOLS_ICONS,
} from "@/constants/icons.constants";
import { ProjectTechStack } from "./ProjectTechStack";
import { ExternalLinkButton } from "@/components/shared/ExternalLinkButton";
import { IconBrandGithub } from "@tabler/icons-react";
import { memo } from "react";

export const Project = memo(function Project({
  name,
  desc,
  urlPreview,
  src,
  techStack,
  workInProgress,
  githubUrl,
}) {
  const { t } = useTranslation();

  const frontendIcons = mapTechStackToIcons(techStack.frontend, FRONTEND_ICONS);
  const backendIcons = mapTechStackToIcons(techStack.backend, BACKEND_ICONS);
  const toolsIcons = mapTechStackToIcons(techStack.tools, TOOLS_ICONS);

  return (
    <a 
      href={urlPreview} 
      target="_blank" 
      rel="noopener noreferrer"
      className={styles.projectLink}
      aria-label={`View ${name} project`}
    >
      <div className={styles.projectContainer}>
        <h3 className={styles.projectTitle}>{name}</h3>
        {src && (
          <div className={`imageContainer ${styles.projectImageContainer}`}>
            <Image
              src={src}
              alt={`${name} ${t("projects.alt")}`}
              fill={true}
              className={`image ${styles.projectImage}`}
              sizes="(max-width: 500px) 100vw, 500px"
              priority={false}
              loading="lazy"
            />
          </div>
        )}
        <p className={styles.projectDesc}>{desc}</p>
        <hr className={styles.projectSeparator}></hr>
        <div className={styles.projectTechStack}>
          {githubUrl.all && (
            <ExternalLinkButton
              text={t("projects.github.all")}
              link={githubUrl.all}
              icon={IconBrandGithub}
            />
          )}

          {techStack.frontend?.length > 0 && (
            <ProjectTechStack
              title={t("projects.techStack.frontend")}
              icons={frontendIcons}
            />
          )}

          {githubUrl.frontend && (
            <ExternalLinkButton
              text={t("projects.github.frontend")}
              link={githubUrl.frontend}
              icon={IconBrandGithub}
            />
          )}

          {techStack.backend?.length > 0 && (
            <ProjectTechStack
              title={t("projects.techStack.backend")}
              icons={backendIcons}
            />
          )}

          {githubUrl.backend && (
            <ExternalLinkButton
              text={t("projects.github.backend")}
              link={githubUrl.backend}
              icon={IconBrandGithub}
            />
          )}

          {techStack.tools?.length > 0 && (
            <ProjectTechStack
              title={t("projects.techStack.tools")}
              icons={toolsIcons}
            />
          )}
        </div>
      </div>
    </a>
  );
});
