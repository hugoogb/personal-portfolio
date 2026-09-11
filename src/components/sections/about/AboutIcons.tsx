import type { FC } from "react";
import type { TechIcon } from "@/constants/icons.constants";

interface AboutIconsProps {
  title: string;
  icons: readonly TechIcon[];
}

/**
 * One named group of technologies.
 *
 * Each entry pairs its icon with the name. The icons used to stand alone with
 * only a `title` tooltip, which never fires on touch and is announced
 * inconsistently - so for anyone who didn't already recognise the glyph the
 * grid was decoration.
 */
export const AboutIcons: FC<AboutIconsProps> = ({ title, icons }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted/70">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {icons.map((icon) => (
          <li
            key={icon.name}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card pl-2.5 pr-3.5 py-1.5 text-[13px] font-semibold text-text/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-text"
          >
            <icon.icon
              stroke={1.5}
              size={16}
              aria-hidden="true"
              className="shrink-0 text-muted transition-colors duration-200 group-hover:text-primary-display"
            />
            {icon.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
