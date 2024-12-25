import Img_f1showcase from "/public/images/f1-showcase.png";
import Img_personalPortfolio from "/public/images/personal-portfolio.png";
import Img_autodetailingEs from "/public/images/autodetailing-es.png";
import Img_dashboard from "/public/images/dashboard.png";

export const PROJECTS = [
  {
    id: 0,
    name: "Formula 1 Showcase",
    desc: "projects.formula1Showcase.description",
    techStack: {
      frontend: ["Vue"],
      backend: ["Nodejs", "Expressjs"],
    },
    urlPreview: "https://f1-showcase.vercel.app",
    src: Img_f1showcase,
    githubUrl: {
      all: "",
      frontend: "https://github.com/hugoogb/f1-showcase",
      backend: "https://github.com/hugoogb/f1-api",
    },
    workInProgress: false,
  },
  {
    id: 1,
    name: "autodetailing.es",
    desc: "projects.autodetailinges.description",
    techStack: {
      frontend: ["Astro"],
      backend: [],
    },
    urlPreview: "https://autodetailing-es.vercel.app/",
    src: Img_autodetailingEs,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
];
