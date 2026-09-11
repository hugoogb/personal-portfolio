import { TechId } from "@/constants/icons.constants";
import type { Project } from "@/types/project.types";

import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import f1TrackerImg from "@/assets/images/f1-tracker.png";
import readledgerImg from "@/assets/images/readledger.png";
import wattwin3dImg from "@/assets/images/wattwin-3d-designer.jpg";

import avatarGenerator640 from "@/assets/images/avatar-generator-640.webp";
import avatarGenerator1280 from "@/assets/images/avatar-generator-1280.webp";
import f1Tracker640 from "@/assets/images/f1-tracker-640.webp";
import f1Tracker1280 from "@/assets/images/f1-tracker-1280.webp";
import readledger640 from "@/assets/images/readledger-640.webp";
import readledger1280 from "@/assets/images/readledger-1280.webp";
import wattwin3d640 from "@/assets/images/wattwin-3d-designer-640.webp";
import wattwin3d1280 from "@/assets/images/wattwin-3d-designer-1280.webp";

const srcSet = (small: string, large: string) => `${small} 640w, ${large} 1280w`;

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "F1 Tracker",
    desc: "The complete history of Formula 1 - every season since 1950 - as an interactive analytics dashboard. A Next.js frontend on Vercel reads from a FastAPI service and PostgreSQL that I host and operate myself on a VPS.",
    techStack: {
      languages: [TechId.Typescript, TechId.Python],
      frontend: [TechId.React, TechId.Nextjs, TechId.Tailwind],
      backend: [TechId.Postgres],
      infra: [TechId.Docker, TechId.Vercel],
    },
    urlPreview: "https://f1-tracker.hugoogb.dev",
    runsOn: "vercel · docker + postgres on my vps",
    src: f1TrackerImg,
    srcSetWebp: srcSet(f1Tracker640, f1Tracker1280),
    stats: ["Self-hosted API + Postgres", "Docker images built in CI", "Weekly automated ingest"],
    repoUrl: "https://github.com/hugoogb/f1-tracker",
  },
  {
    id: 1,
    name: "ReadLedger",
    desc: "A manga collection tracker that goes past a checklist - it follows reading progress, what you've spent, and how much you've saved buying second-hand. Series metadata and cover art come from MangaDex.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Nextjs, TechId.Tailwind],
      backend: [TechId.Supabase, TechId.Prisma],
      infra: [TechId.Vercel],
    },
    urlPreview: "https://readledger.app",
    runsOn: "vercel · supabase",
    src: readledgerImg,
    srcSetWebp: srcSet(readledger640, readledger1280),
    stats: ["MangaDex import", "Spend & savings analytics", "Wishlist + stats dashboard"],
    repoUrl: "https://github.com/hugoogb/readledger",
  },
  {
    id: 2,
    name: "Wattwin - 3D PV Designer",
    desc: "My software-engineering degree project, built at Wattwin: a 3D photovoltaic designer that works out how surrounding obstacles shade each solar panel across a full year. A ray-tracing engine recalculates in real time over WebSockets as panels are moved, and everything renders in a Babylon.js viewer, with Google Solar API data for terrain and building exposure.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.Angular],
      backend: [TechId.Nodejs, TechId.Postgres],
      infra: [],
    },
    urlPreview: "",
    runsOn: "angular · babylon.js · websockets",
    src: wattwin3dImg,
    srcSetWebp: srcSet(wattwin3d640, wattwin3d1280),
    stats: [
      "Year-long shading simulation",
      "Real-time recompute over WebSockets",
      "Babylon.js 3D viewer",
    ],
    closedSource: "Client work · closed source",
  },
  {
    id: 3,
    name: "@avatar-generator",
    desc: "A deterministic SVG avatar library: the same seed always produces the same avatar, in styles from initials to pixel art. Published as a scope rather than one package - a core, a package per style, and renderers for React, Vue, Svelte, Angular and plain HTML - so you install only what you actually render.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [],
      backend: [],
      infra: [TechId.Npm, TechId.Pnpm],
    },
    urlPreview: "https://avatar-generator.hugoogb.dev",
    src: avatarGeneratorImg,
    srcSetWebp: srcSet(avatarGenerator640, avatarGenerator1280),
    stats: ["Zero runtime deps", "One package per style", "Framework renderers + web component"],
    repoUrl: "https://github.com/hugoogb/avatar-generator",
    npmUrl: "https://www.npmjs.com/org/avatar-generator",
  },
];
