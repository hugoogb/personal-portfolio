import Img_f1showcase from "/public/images/f1-showcase.png";
import Img_autodetailingEs from "/public/images/autodetailing-es.png";
import Img_avatarGenerator from "/public/images/avatar-generator.png";

export const PROJECTS = [
  {
    id: 0,
    name: "Formula 1 Showcase",
    desc: "projects.formula1Showcase.description",
    techStack: {
      frontend: ["Vue"],
      backend: ["Nodejs", "Expressjs"],
      tools: [],
    },
    urlPreview: "https://f1-showcase.vercel.app",
    src: Img_f1showcase,
    githubUrl: {
      all: "",
      frontend: "https://github.com/hugoogb/f1-showcase",
      backend: "https://github.com/hugoogb/f1-api",
    },
  },
  {
    id: 1,
    name: "autodetailing.es",
    desc: "projects.autodetailinges.description",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: [],
    },
    urlPreview: "https://autodetailing-es.vercel.app/",
    src: Img_autodetailingEs,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 2,
    name: "@avatar-generator",
    desc: "projects.avatar-generator.description",
    techStack: {
      frontend: ["Astro"],
      backend: [],
      tools: ["npm", "pnpm"],
    },
    urlPreview: "https://avatar-generator-two.vercel.app/",
    src: Img_avatarGenerator,
    githubUrl: {
      all: "https://github.com/hugoogb/avatar-generator",
      frontend: "",
      backend: "",
    },
  },
];
