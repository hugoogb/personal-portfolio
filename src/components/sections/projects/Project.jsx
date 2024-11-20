import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "@/styles/modules/Projects.module.css";
import { mapTechStackToIcons } from "@/utils/iconsTechStackMapper";
import { BACKEND_ICONS, FRONTEND_ICONS } from "@/constants/icons.constants";
import { ProjectTechStack } from "./ProjectTechStack";

export function Project({ name, desc, urlPreview, src, techStack }) {
  const { t } = useTranslation();

  const frontendIcons = mapTechStackToIcons(techStack.frontend, FRONTEND_ICONS);
  const backendIcons = mapTechStackToIcons(techStack.backend, BACKEND_ICONS);

  return (
    <a href={urlPreview} target="_blank" className={styles.projectLink}>
      <div className={styles.projectContainer}>
        <h3 className={styles.projectTitle}>{name}</h3>
        {src && (
          <div className={`imageContainer ${styles.projectImageContainer}`}>
            <Image
              src={src}
              alt={`${name} ${t("projects.alt")}`}
              fill={true}
              className={`image ${styles.projectImage}`}
              unoptimized={true}
            ></Image>
          </div>
        )}
        <p className={styles.projectDesc}>{desc}</p>
        <hr className={styles.projectSeparator}></hr>
        <div className={styles.projectTechStack}>
          {techStack.frontend?.length > 0 && (
            <ProjectTechStack
              title={t("projects.techStack.frontend")}
              icons={frontendIcons}
            />
          )}
          {techStack.backend?.length > 0 && (
            <ProjectTechStack
              title={t("projects.techStack.backend")}
              icons={backendIcons}
            />
          )}
        </div>
      </div>
    </a>
  );
}
