import type { Icon } from "@tabler/icons-react";
import {
  IconBrandAngular,
  IconBrandAstro,
  IconBrandBitbucketFilled,
  IconBrandCss3,
  IconBrandDocker,
  IconBrandGit,
  IconBrandGithub,
  IconBrandHtml5,
  IconBrandJavascript,
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
  IconLayoutKanbanFilled,
  IconSql,
} from "@tabler/icons-react";
import { SiNestjs } from "react-icons/si";

export enum TechId {
  HTML = "HTML",
  CSS = "CSS",
  Javascript = "Javascript",
  Typescript = "Typescript",
  React = "React",
  Nextjs = "Nextjs",
  Angular = "Angular",
  Astro = "Astro",
  Nestjs = "Nestjs",
  Tailwind = "Tailwind",
  Vite = "Vite",
  Nodejs = "Nodejs",
  SQL = "SQL",
  Mongodb = "Mongodb",
  Supabase = "Supabase",
  Prisma = "Prisma",
  Python = "Python",
  Npm = "Npm",
  Pnpm = "Pnpm",
  Git = "Git",
  Github = "Github",
  Bitbucket = "Bitbucket",
  Jira = "Jira",
  Docker = "Docker",
  Vercel = "Vercel",
}

export interface TechIcon {
  id: number;
  icon: Icon | React.FC;
  name: TechId;
}

export const FRONTEND_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandHtml5,
    name: TechId.HTML,
  },
  {
    id: 1,
    icon: IconBrandCss3,
    name: TechId.CSS,
  },
  {
    id: 2,
    icon: IconBrandJavascript,
    name: TechId.Javascript,
  },
  {
    id: 3,
    icon: IconBrandTypescript,
    name: TechId.Typescript,
  },
  {
    id: 4,
    icon: IconBrandTailwind,
    name: TechId.Tailwind,
  },
];

export const FRAMEWORKS_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandReact,
    name: TechId.React,
  },
  {
    id: 1,
    icon: IconBrandNextjs,
    name: TechId.Nextjs,
  },
  {
    id: 2,
    icon: IconBrandAngular,
    name: TechId.Angular,
  },
  {
    id: 3,
    icon: IconBrandAstro,
    name: TechId.Astro,
  },
  {
    id: 4,
    icon: IconBrandVite,
    name: TechId.Vite,
  },
];

export const BACKEND_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandNodejs,
    name: TechId.Nodejs,
  },
  {
    id: 1,
    icon: IconSql,
    name: TechId.SQL,
  },
  {
    id: 2,
    icon: IconBrandMongodb,
    name: TechId.Mongodb,
  },
  {
    id: 3,
    icon: SiNestjs as React.FC,
    name: TechId.Nestjs,
  },
  {
    id: 4,
    icon: IconBrandSupabase,
    name: TechId.Supabase,
  },
  {
    id: 5,
    icon: IconBrandPrisma,
    name: TechId.Prisma,
  },
  {
    id: 6,
    icon: IconBrandPython,
    name: TechId.Python,
  },
];

export const TOOLS_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandNpm,
    name: TechId.Npm,
  },
  {
    id: 1,
    icon: IconBrandPnpm,
    name: TechId.Pnpm,
  },
  {
    id: 2,
    icon: IconBrandGit,
    name: TechId.Git,
  },
  {
    id: 3,
    icon: IconBrandGithub,
    name: TechId.Github,
  },
  {
    id: 4,
    icon: IconBrandBitbucketFilled,
    name: TechId.Bitbucket,
  },
  {
    id: 5,
    icon: IconLayoutKanbanFilled,
    name: TechId.Jira,
  },
  {
    id: 6,
    icon: IconBrandDocker,
    name: TechId.Docker,
  },
  {
    id: 7,
    icon: IconBrandVercel,
    name: TechId.Vercel,
  },
];
