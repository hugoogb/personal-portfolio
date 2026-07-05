import { TechId } from "@/constants/icons.constants";
import type { Project } from "@/types/project.types";

import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import f1TrackerImg from "@/assets/images/f1-tracker.png";
import profileKitMeImg from "@/assets/images/profilekit.me.png";
import readledgerImg from "@/assets/images/readledger.png";
import wattwin3dImg from "@/assets/images/wattwin-3d-designer.jpg";

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "F1 Tracker",
    desc: "The complete history of Formula 1 - every season since 1950 - as an interactive analytics dashboard. Next.js and Tailwind on top of a FastAPI service and PostgreSQL, fed by a Python pipeline that ingests decades of race and telemetry data.",
    techStack: {
      frontend: [TechId.Typescript, TechId.Tailwind],
      frameworks: [TechId.React, TechId.Nextjs],
      backend: [TechId.SQL, TechId.Python],
      tools: [TechId.Docker, TechId.Vercel],
    },
    urlPreview: "https://f1-tracker-web.vercel.app",
    src: f1TrackerImg,
    githubUrl: {
      all: "https://github.com/hugoogb/f1-tracker",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 1,
    name: "ReadLedger",
    desc: "A manga collection tracker that goes past a checklist: it tracks reading progress, spending, and how much you've saved buying second-hand. Next.js, Supabase, and Prisma, with MangaDex integration for covers and metadata.",
    techStack: {
      frontend: [TechId.Typescript, TechId.Tailwind],
      frameworks: [TechId.React, TechId.Nextjs],
      backend: [TechId.Supabase, TechId.Prisma],
      tools: [TechId.Vercel],
    },
    urlPreview: "https://readledger.app/",
    src: readledgerImg,
    githubUrl: {
      all: "https://github.com/hugoogb/readledger",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 2,
    name: "Wattwin - 3D PV Designer",
    desc: "A 3D photovoltaic designer I built as my software-engineering degree project at Wattwin. It computes how surrounding obstacles shade each solar panel across a full year with a ray-tracing engine, recalculates in real time over WebSockets as panels are moved, and renders everything in a Babylon.js 3D viewer - plus a Google Solar API integration for terrain and building exposure.",
    techStack: {
      frontend: [TechId.Typescript],
      frameworks: [TechId.Angular],
      backend: [TechId.Nodejs, TechId.SQL],
      tools: [],
    },
    urlPreview: "",
    src: wattwin3dImg,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 3,
    name: "ProfileKit.me",
    desc: "A drag-and-drop builder for personal bio pages at a custom URL: 14+ block types, style presets, analytics, and contact forms. Next.js, Supabase, and Prisma with a live-preview editor.",
    techStack: {
      frontend: [TechId.Typescript, TechId.Tailwind],
      frameworks: [TechId.React, TechId.Nextjs],
      backend: [TechId.Supabase, TechId.Prisma],
      tools: [TechId.Vercel],
    },
    urlPreview: "https://profilekit.me/",
    src: profileKitMeImg,
    githubUrl: {
      all: "",
      frontend: "",
      backend: "",
    },
  },
  {
    id: 4,
    name: "@avatar-generator",
    desc: "A framework-agnostic avatar-generation library, published to npm with fully customizable options and drop-in integration.",
    techStack: {
      frontend: [TechId.Typescript],
      frameworks: [],
      backend: [],
      tools: [TechId.Npm, TechId.Pnpm],
    },
    urlPreview: "https://avatar-generator-two.vercel.app/",
    src: avatarGeneratorImg,
    githubUrl: {
      all: "https://github.com/hugoogb/avatar-generator",
      frontend: "",
      backend: "",
    },
  },
] as const;
