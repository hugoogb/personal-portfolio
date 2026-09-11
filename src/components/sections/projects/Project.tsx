import { mapTechStackToIcons } from "@/utils/iconsTechStackMapper";
import {
  BACKEND_ICONS,
  FRONTEND_ICONS,
  INFRA_ICONS,
  LANGUAGE_ICONS,
} from "@/constants/icons.constants";
import { ProjectTechStack } from "./ProjectTechStack";
import { ExternalLinkButton } from "@/components/shared/ExternalLinkButton";
import { IconBrandGithub, IconBrandNpm, IconLock, IconWorld } from "@tabler/icons-react";
import type { FC } from "react";
import { memo } from "react";
import type { Project as ProjectType } from "@/types/project.types";
import { ALT_TEXT } from "@/constants/strings.constants";
import { motion } from "motion/react";

export const Project: FC<ProjectType> = memo(function Project({
  name,
  desc,
  urlPreview,
  src,
  srcSetWebp,
  techStack,
  runsOn,
  repoUrl,
  npmUrl,
  stats,
  closedSource,
}) {
  // Flattened in reading order rather than split into labelled groups.
  const techIcons = [
    ...mapTechStackToIcons(techStack.languages, LANGUAGE_ICONS),
    ...mapTechStackToIcons(techStack.frontend, FRONTEND_ICONS),
    ...mapTechStackToIcons(techStack.backend, BACKEND_ICONS),
    ...mapTechStackToIcons(techStack.infra, INFRA_ICONS),
  ];

  const shot = src && (
    <picture>
      {srcSetWebp && (
        <source type="image/webp" srcSet={srcSetWebp} sizes="(min-width: 768px) 340px, 100vw" />
      )}
      <img
        src={src}
        alt={ALT_TEXT.PROJECT(name)}
        className="w-full h-full object-cover object-left-top"
        loading="lazy"
        decoding="async"
        width={1600}
        height={900}
      />
    </picture>
  );

  return (
    <motion.article
      className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-6 md:gap-10 items-center py-7 sm:py-8 border-t border-border"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {urlPreview ? (
        <a
          href={urlPreview}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-video md:aspect-[340/186] rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors"
        >
          {shot}
        </a>
      ) : (
        <div className="aspect-video md:aspect-[340/186] rounded-2xl overflow-hidden border border-border bg-card">
          {shot}
        </div>
      )}

      <div className="flex flex-col gap-2.5 text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-text">
            {name}
          </h3>
          {urlPreview && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted/70">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              live
            </span>
          )}
        </div>

        <p className="text-muted leading-relaxed text-sm sm:text-base max-w-prose">{desc}</p>

        {stats && stats.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-0.5">
            {stats.map((stat) => (
              <li
                key={stat}
                className="inline-flex items-center rounded-full bg-primary/15 text-text px-3 py-1 text-xs font-semibold tracking-tight"
              >
                {stat}
              </li>
            ))}
          </ul>
        )}

        {techIcons.length > 0 && <ProjectTechStack icons={techIcons} />}

        {runsOn && (
          <p className="flex items-center gap-2 text-xs">
            <span className="text-muted/60">{urlPreview ? "runs on" : "built with"}</span>
            <span className="font-mono text-muted">{runsOn}</span>
          </p>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          {urlPreview && <ExternalLinkButton text="Live Demo" link={urlPreview} icon={IconWorld} />}
          {repoUrl && (
            <ExternalLinkButton text="View Source" link={repoUrl} icon={IconBrandGithub} />
          )}
          {npmUrl && <ExternalLinkButton text="npm" link={npmUrl} icon={IconBrandNpm} />}
          {!repoUrl && !npmUrl && closedSource && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-muted/5 text-sm font-medium text-muted">
              <IconLock stroke={1.5} size={18} className="text-muted" />
              {closedSource}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
});
