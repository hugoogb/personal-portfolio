import { mapTechStackToIcons } from "@/utils/iconsTechStackMapper";
import { BACKEND_ICONS, FRONTEND_ICONS, TOOLS_ICONS } from "@/constants/icons.constants";
import { ProjectTechStack } from "./ProjectTechStack";
import { ExternalLinkButton } from "@/components/shared/ExternalLinkButton";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";
import type { FC } from "react";
import { memo } from "react";
import type { Project as ProjectType } from "@/types/project.types";
import { ALT_TEXT } from "@/constants/strings.constants";
import { motion } from "motion/react";

interface ProjectProps extends ProjectType {
  workInProgress?: boolean;
}

export const Project: FC<ProjectProps> = memo(function Project({
  name,
  desc,
  urlPreview,
  src,
  techStack,
  githubUrl,
}) {
  const frontendIcons = mapTechStackToIcons(techStack.frontend, FRONTEND_ICONS);
  const backendIcons = mapTechStackToIcons(techStack.backend, BACKEND_ICONS);
  const toolsIcons = mapTechStackToIcons(techStack.tools, TOOLS_ICONS);

  return (
    <motion.div
      className="flex flex-col bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-colors duration-500"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <a
        href={urlPreview}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative aspect-video overflow-hidden"
      >
        {src && (
          <>
            <motion.img
              src={src}
              alt={ALT_TEXT.PROJECT(name)}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
              <div className="p-3 bg-background/90 backdrop-blur-md rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <IconExternalLink size={24} className="text-primary" />
              </div>
            </div>
          </>
        )}
      </a>

      <div className="flex-1 p-6 sm:p-8 flex flex-col space-y-6 text-left">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold tracking-tight text-text flex items-center justify-between">
            {name}
          </h3>
          <p className="text-muted leading-relaxed text-sm sm:text-base">{desc}</p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {techStack.frontend?.length > 0 && (
              <ProjectTechStack title="Frontend" icons={frontendIcons} />
            )}
            {techStack.backend?.length > 0 && (
              <ProjectTechStack title="Backend" icons={backendIcons} />
            )}
            {techStack.tools?.length > 0 && <ProjectTechStack title="Tools" icons={toolsIcons} />}
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-3">
          {githubUrl.all && (
            <ExternalLinkButton text="View Source" link={githubUrl.all} icon={IconBrandGithub} />
          )}
          {githubUrl.frontend && (
            <ExternalLinkButton
              text="Frontend Code"
              link={githubUrl.frontend}
              icon={IconBrandGithub}
            />
          )}
          {githubUrl.backend && (
            <ExternalLinkButton
              text="Backend Code"
              link={githubUrl.backend}
              icon={IconBrandGithub}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
});
