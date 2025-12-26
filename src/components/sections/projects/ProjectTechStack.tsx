import type { FC } from "react";
import type { TechIcon } from "@/constants/icons.constants";
import { motion } from "motion/react";

interface ProjectTechStackProps {
  title: string;
  icons: TechIcon[];
}

export const ProjectTechStack: FC<ProjectTechStackProps> = ({ title, icons }) => {
  return (
    <div className="space-y-2">
      <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted/60">{title}</h5>
      <div className="flex flex-wrap gap-4">
        {icons.map((icon, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 group/icon"
            title={icon.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <icon.icon
              stroke={1.5}
              size={16}
              className="text-muted group-hover/icon:text-primary transition-colors"
            />
            <span className="text-xs font-medium text-muted/80">{icon.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
