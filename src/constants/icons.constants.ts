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
  IconBrandReact,
  IconBrandSupabase,
  IconBrandTypescript,
  IconLayoutKanbanFilled,
  IconSql
} from "@tabler/icons-react";
import { SiNestjs } from "react-icons/si";

export interface TechIcon {
  id: number;
  icon: Icon | React.FC;
  name: string;
}

export const FRONTEND_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandHtml5,
    name: "HTML",
  },
  {
    id: 1,
    icon: IconBrandCss3,
    name: "CSS",
  },
  {
    id: 2,
    icon: IconBrandJavascript,
    name: "Javascript",
  },
  {
    id: 3,
    icon: IconBrandTypescript,
    name: "Typescript",
  },
  {
    id: 4,
    icon: IconBrandReact,
    name: "React",
  },
  {
    id: 5,
    icon: IconBrandNextjs,
    name: "Nextjs",
  },
  {
    id: 6,
    icon: IconBrandAngular,
    name: "Angular",
  },
  {
    id: 7,
    icon: IconBrandAstro,
    name: "Astro",
  },
];

export const BACKEND_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandNodejs,
    name: "Nodejs",
  },
  {
    id: 1,
    icon: SiNestjs as React.FC,
    name: "Nestjs",
  },
  {
    id: 2,
    icon: IconSql,
    name: "SQL",
  },
  {
    id: 3,
    icon: IconBrandMongodb,
    name: "Mongodb",
  },
  {
    id: 4,
    icon: IconBrandSupabase,
    name: "Supabase",
  },
  {
    id: 5,
    icon: IconBrandPrisma,
    name: "Prisma",
  },
];

export const TOOLS_ICONS: TechIcon[] = [
  {
    id: 0,
    icon: IconBrandNpm,
    name: "Npm",
  },
  {
    id: 1,
    icon: IconBrandPnpm,
    name: "Pnpm",
  },
  {
    id: 2,
    icon: IconBrandGit,
    name: "Git",
  },
  {
    id: 3,
    icon: IconBrandGithub,
    name: "Github",
  },
  {
    id: 4,
    icon: IconBrandBitbucketFilled,
    name: "Bitbucket",
  },
  {
    id: 5,
    icon: IconLayoutKanbanFilled,
    name: "Jira",
  },
  {
    id: 6,
    icon: IconBrandDocker,
    name: "Docker",
  },
];
