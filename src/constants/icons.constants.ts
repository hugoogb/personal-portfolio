import type { Icon } from "@tabler/icons-react";
import {
  IconBrandNodejs,
  IconBrandMongodb,
  IconBrandNpm,
  IconBrandGit,
  IconBrandDocker,
  IconLayoutKanbanFilled,
  IconBrandBitbucketFilled,
  IconBrandPnpm,
  IconBrandGithub,
  IconBrandAstro,
  IconBrandAngular,
  IconBrandNextjs,
  IconBrandReact,
  IconBrandCss3,
  IconBrandHtml5,
  IconBrandJavascript,
  IconBrandTypescript,
  IconSql,
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
    icon: IconBrandAngular,
    name: "Angular",
  },
  {
    id: 6,
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
    icon: IconBrandNextjs,
    name: "Nextjs",
  },
  {
    id: 2,
    icon: SiNestjs as React.FC,
    name: "Nestjs",
  },
  {
    id: 3,
    icon: IconSql,
    name: "SQL",
  },
  {
    id: 4,
    icon: IconBrandMongodb,
    name: "Mongodb",
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
