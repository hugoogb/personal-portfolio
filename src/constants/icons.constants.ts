import type { Icon } from "@tabler/icons-react";
import {
  IconBrandAngular,
  IconBrandAstro,
  IconBrandDocker,
  IconBrandGithub,
  IconBrandMongodb,
  IconBrandNextjs,
  IconBrandNodejs,
  IconBrandNpm,
  IconBrandPnpm,
  IconBrandPrisma,
  IconBrandPython,
  IconBrandReact,
  IconBrandSupabase,
  IconBrandTailwind,
  IconBrandTypescript,
  IconBrandVercel,
  IconBrandVite,
} from "@tabler/icons-react";
import { SiNestjs, SiPostgresql } from "react-icons/si";

export enum TechId {
  Typescript = "TypeScript",
  Python = "Python",
  React = "React",
  Nextjs = "Next.js",
  Angular = "Angular",
  Astro = "Astro",
  Tailwind = "Tailwind",
  Nodejs = "Node.js",
  Nestjs = "NestJS",
  Postgres = "PostgreSQL",
  Mongodb = "MongoDB",
  Supabase = "Supabase",
  Prisma = "Prisma",
  Docker = "Docker",
  Vercel = "Vercel",
  Github = "GitHub",
  Vite = "Vite",
  Npm = "npm",
  Pnpm = "pnpm",
}

export interface TechIcon {
  id: number;
  icon: Icon | React.FC;
  name: TechId;
}

export const LANGUAGE_ICONS: TechIcon[] = [
  { id: 0, icon: IconBrandTypescript, name: TechId.Typescript },
  { id: 1, icon: IconBrandPython, name: TechId.Python },
];

export const FRONTEND_ICONS: TechIcon[] = [
  { id: 0, icon: IconBrandReact, name: TechId.React },
  { id: 1, icon: IconBrandNextjs, name: TechId.Nextjs },
  { id: 2, icon: IconBrandAngular, name: TechId.Angular },
  { id: 3, icon: IconBrandAstro, name: TechId.Astro },
  { id: 4, icon: IconBrandTailwind, name: TechId.Tailwind },
];

export const BACKEND_ICONS: TechIcon[] = [
  { id: 0, icon: IconBrandNodejs, name: TechId.Nodejs },
  { id: 1, icon: SiNestjs as React.FC, name: TechId.Nestjs },
  { id: 2, icon: SiPostgresql as React.FC, name: TechId.Postgres },
  { id: 3, icon: IconBrandMongodb, name: TechId.Mongodb },
  { id: 4, icon: IconBrandPrisma, name: TechId.Prisma },
  { id: 5, icon: IconBrandSupabase, name: TechId.Supabase },
];

export const INFRA_ICONS: TechIcon[] = [
  { id: 0, icon: IconBrandDocker, name: TechId.Docker },
  { id: 1, icon: IconBrandVercel, name: TechId.Vercel },
  { id: 2, icon: IconBrandGithub, name: TechId.Github },
  { id: 3, icon: IconBrandVite, name: TechId.Vite },
  { id: 4, icon: IconBrandNpm, name: TechId.Npm },
  { id: 5, icon: IconBrandPnpm, name: TechId.Pnpm },
];

/** Rendered in this order in the About panel. */
export const TECH_GROUPS = [
  { label: "Languages", icons: LANGUAGE_ICONS },
  { label: "Frontend", icons: FRONTEND_ICONS },
  { label: "Backend and data", icons: BACKEND_ICONS },
  { label: "Infrastructure and delivery", icons: INFRA_ICONS },
] as const;
