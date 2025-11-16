import type { Project } from "@/types/project.types";

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "autodetailing.es",
    desc: "projects.autodetailinges.description",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: [],
    },
    urlPreview: "https://autodetailing-es.vercel.app/",
    src: "/images/autodetailing-es.png",
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 1,
    name: "@avatar-generator",
    desc: "projects.avatar-generator.description",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: ["npm", "pnpm"],
    },
    urlPreview: "https://avatar-generator-two.vercel.app/",
    src: "/images/avatar-generator.png",
    githubUrl: {
      all: "https://github.com/hugoogb/avatar-generator",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 2,
    name: "Socials Impact",
    desc: "projects.socialsImpact.description",
    techStack: {
      frontend: ["React"],
      backend: ["Nextjs"],
      tools: [],
    },
    urlPreview: "https://socials-impact.vercel.app/",
    src: "/images/socials-impact.png",
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
] as const;
