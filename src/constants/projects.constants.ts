import { TechId } from "@/constants/icons.constants";
import type { Project } from "@/types/project.types";

import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import estonoesunrestauranteImg from "@/assets/images/estonoesunrestaurante.png";
import f1TrackerImg from "@/assets/images/f1-tracker.png";
import readledgerImg from "@/assets/images/readledger.png";

import avatarGenerator640 from "@/assets/images/avatar-generator-640.webp";
import avatarGenerator1280 from "@/assets/images/avatar-generator-1280.webp";
import estonoesunrestaurante640 from "@/assets/images/estonoesunrestaurante-640.webp";
import estonoesunrestaurante1280 from "@/assets/images/estonoesunrestaurante-1280.webp";
import f1Tracker640 from "@/assets/images/f1-tracker-640.webp";
import f1Tracker1280 from "@/assets/images/f1-tracker-1280.webp";
import readledger640 from "@/assets/images/readledger-640.webp";
import readledger1280 from "@/assets/images/readledger-1280.webp";

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
    desc: "A manga collection tracker that goes past a checklist - it follows reading progress and yearly goals, what you've spent, and how much you've saved buying second-hand, with series metadata and covers from MangaDex. It started on Vercel and Supabase; I moved it onto my own VPS as a Docker container on Postgres behind PgBouncer, and replaced Supabase Auth with passwordless email codes.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Nextjs, TechId.Tailwind],
      backend: [TechId.Postgres, TechId.Prisma],
      infra: [TechId.Docker],
    },
    urlPreview: "https://readledger.app",
    runsOn: "docker + postgres on my vps",
    src: readledgerImg,
    srcSetWebp: srcSet(readledger640, readledger1280),
    stats: [
      "Migrated off Vercel + Supabase",
      "Passwordless email-code auth",
      "Spend & second-hand savings analytics",
    ],
    repoUrl: "https://github.com/hugoogb/readledger",
  },
  {
    id: 2,
    name: "Esto no es un restaurante",
    desc: 'A meal planner for one household that takes "what do I cook today?" off the table: it suggests dishes the family already cooks, weighing what was eaten lately, what\'s in the pantry and the day of the week, and says why for each. Built for a home cook with one hand free and patchy wifi, so it works offline. A React PWA and a NestJS API in one pnpm monorepo, sharing Zod schemas, on my VPS. Invite-only, in Spanish.',
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Tailwind],
      backend: [TechId.Nestjs, TechId.Postgres, TechId.Prisma],
      infra: [TechId.Docker, TechId.Vite, TechId.Pnpm],
    },
    urlPreview: "https://estonoesunrestaurante.com",
    previewLabel: "Open the app",
    runsOn: "docker on my vps · caddy, nestjs, postgres",
    src: estonoesunrestauranteImg,
    srcSetWebp: srcSet(estonoesunrestaurante640, estonoesunrestaurante1280),
    stats: [
      "Offline-first PWA with idempotent replay",
      "Explainable suggestion engine",
      "Zod schemas shared web ↔ API",
    ],
    closedSource: "Private household app · closed source",
  },
  {
    id: 3,
    name: "@avatar-generator",
    desc: "A deterministic SVG avatar library: the same seed always produces the same avatar, in eleven styles from initials to pixel art and anime. Published as a scope rather than one package - a core, a package per style, and renderers for React, Vue, Svelte, Angular and plain HTML - so you install only what you actually render.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.Astro],
      backend: [],
      infra: [TechId.Npm, TechId.Pnpm],
    },
    urlPreview: "https://avatar-generator.hugoogb.dev",
    previewLabel: "Read the docs",
    src: avatarGeneratorImg,
    srcSetWebp: srcSet(avatarGenerator640, avatarGenerator1280),
    stats: ["Zero-dependency core", "One package per style", "Framework renderers + web component"],
    repoUrl: "https://github.com/hugoogb/avatar-generator",
    npmUrl: "https://www.npmjs.com/org/avatar-generator",
  },
];
