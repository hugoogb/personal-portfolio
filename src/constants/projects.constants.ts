import type { Project } from "@/types/project.types";

import autodetailingImg from "@/assets/images/autodetailing-es.png";
import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import socialsImpactImg from "@/assets/images/socials-impact.png";
import readledgerImg from "@/assets/images/readledger.png";

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "autodetailing.es",
    desc: "Informative page for a car detailing services company, optimized for SEO and performance",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: [],
    },
    urlPreview: "https://autodetailing-es.vercel.app/",
    src: autodetailingImg,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 1,
    name: "@avatar-generator",
    desc: "Provides a customizable avatar generation library that is framework-agnostic. Easy integration with customizable options.",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: ["npm", "pnpm"],
    },
    urlPreview: "https://avatar-generator-two.vercel.app/",
    src: avatarGeneratorImg,
    githubUrl: {
      all: "https://github.com/hugoogb/avatar-generator",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 2,
    name: "Socials Impact",
    desc: "Social media analytics dashboard platform to track growth across YouTube, Twitch, TikTok, and Instagram. Visualize performance metrics, analyze trends, and make data-driven decisions.",
    techStack: {
      frontend: ["React"],
      backend: ["Nextjs"],
      tools: [],
    },
    urlPreview: "https://socials-impact.vercel.app/",
    src: socialsImpactImg,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 3,
    name: "ReadLedger",
    desc: "ReadLedger is a platform for managing your book series, track owning books and reading progress. Check how much you saved buying all the books you've read. Manga focused for now.",
    techStack: {
      frontend: ["React"],
      backend: ["Nextjs"],
      tools: [],
    },
    urlPreview: "https://readledger.vercel.app/",
    src: readledgerImg,
    githubUrl: {
      all: "https://github.com/hugoogb/readledger",
      frontend: "",
      backend: "",
    },
  }
] as const;
