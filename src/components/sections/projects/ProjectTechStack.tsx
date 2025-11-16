import type { FC } from "react";
import styles from "@/styles/modules/Projects.module.css";
import type { TechIcon } from "@/constants/icons.constants";
import { ICON_SIZES } from "@/constants/design.constants";

interface ProjectTechStackProps {
  title: string;
  icons: TechIcon[];
}

export const ProjectTechStack: FC<ProjectTechStackProps> = ({
  title,
  icons,
}) => {
  return (
    <div>
      <h5>{title}</h5>
      <div className={styles.projectTechStackIconsWrapper}>
        {icons.map((icon, index) => (
          <div key={index} className={styles.projectTechIcon} title={icon.name}>
            <icon.icon stroke={1.25} size={ICON_SIZES.md} />
            <span>{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
