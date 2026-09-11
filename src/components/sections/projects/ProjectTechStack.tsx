import type { FC } from "react";
import type { TechIcon } from "@/constants/icons.constants";

interface ProjectTechStackProps {
  icons: TechIcon[];
}

/**
 * One flat row of the technologies a project uses.
 *
 * This used to render four labelled groups (Frontend / Frameworks / Backend /
 * Tools), which cost ~18% of each card's height to say something the reader
 * already infers from the names themselves.
 */
export const ProjectTechStack: FC<ProjectTechStackProps> = ({ icons }) => {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {icons.map((icon) => (
        <li key={icon.name} className="group flex items-center gap-1.5">
          <icon.icon
            stroke={1.5}
            size={15}
            aria-hidden="true"
            className="text-muted/70 transition-colors duration-200 group-hover:text-primary-display"
          />
          <span className="text-xs font-medium text-muted transition-colors duration-200 group-hover:text-text">
            {icon.name}
          </span>
        </li>
      ))}
    </ul>
  );
};
