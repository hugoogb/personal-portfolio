import { TechId } from "@/constants/icons.constants";
import type { Project } from "@/types/project.types";

import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import estonoesunrestauranteImg from "@/assets/images/estonoesunrestaurante.png";
import f1TrackerImg from "@/assets/images/f1-tracker.png";
import readledgerImg from "@/assets/images/readledger.png";
import wrappedThingsImg from "@/assets/images/wrapped-things.png";

import avatarGenerator640 from "@/assets/images/avatar-generator-640.webp";
import avatarGenerator1280 from "@/assets/images/avatar-generator-1280.webp";
import estonoesunrestaurante640 from "@/assets/images/estonoesunrestaurante-640.webp";
import estonoesunrestaurante1280 from "@/assets/images/estonoesunrestaurante-1280.webp";
import f1Tracker640 from "@/assets/images/f1-tracker-640.webp";
import f1Tracker1280 from "@/assets/images/f1-tracker-1280.webp";
import readledger640 from "@/assets/images/readledger-640.webp";
import readledger1280 from "@/assets/images/readledger-1280.webp";
import wrappedThings640 from "@/assets/images/wrapped-things-640.webp";
import wrappedThings1280 from "@/assets/images/wrapped-things-1280.webp";

const srcSet = (small: string, large: string) => `${small} 640w, ${large} 1280w`;

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "F1 Tracker",
    desc: "Every Formula 1 season since 1950 as an interactive analytics dashboard - results, records, lap timing and title permutations, served by a Python API over PostgreSQL.",
    techStack: {
      languages: [TechId.Typescript, TechId.Python],
      frontend: [TechId.React, TechId.Nextjs, TechId.Tailwind],
      backend: [TechId.Postgres],
      infra: [TechId.Docker, TechId.Vercel],
    },
    urlPreview: "https://f1-tracker.hugoogb.dev",
    runsOn: "vercel · fastapi + postgres in docker",
    src: f1TrackerImg,
    srcSetWebp: srcSet(f1Tracker640, f1Tracker1280),
    stats: ["Self-hosted API + Postgres", "Docker images built in CI", "Weekly automated ingest"],
    repoUrl: "https://github.com/hugoogb/f1-tracker",
  },
  {
    id: 1,
    name: "ReadLedger",
    desc: "A manga collection tracker that goes past a checklist - reading progress, yearly goals, what you've spent and what you've saved buying second-hand, with series data from MangaDex.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Nextjs, TechId.Tailwind],
      backend: [TechId.Postgres, TechId.Prisma],
      infra: [TechId.Docker],
    },
    urlPreview: "https://readledger.app",
    runsOn: "docker · postgres + pgbouncer",
    src: readledgerImg,
    srcSetWebp: srcSet(readledger640, readledger1280),
    stats: ["MangaDex import", "Passwordless email-code auth", "Spend & savings analytics"],
    repoUrl: "https://github.com/hugoogb/readledger",
  },
  {
    id: 2,
    name: "Wrapped Things",
    desc: "A social counter for the things you actually do - gym visits, books, beers, flights. Log them, race friends head-to-head, and unwrap your week, month or year as a shareable Wrap.",
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Expo],
      backend: [TechId.Supabase, TechId.Postgres],
      infra: [],
    },
    urlPreview: "https://wrappedthings.app",
    previewLabel: "Join the waitlist",
    status: "pre-launch",
    runsOn: "expo · react native · supabase",
    src: wrappedThingsImg,
    srcSetWebp: srcSet(wrappedThings640, wrappedThings1280),
    stats: ["Local-first sync + realtime", "Shareable Wrap image export", "Row-level security"],
    closedSource: "Pre-launch · closed source",
  },
  {
    id: 3,
    name: "Esto no es un restaurante",
    desc: 'A meal planner that answers "what do I cook today?" with dishes the family already makes, and says why it picked each one. Offline-first, in Spanish, invite-only.',
    techStack: {
      languages: [TechId.Typescript],
      frontend: [TechId.React, TechId.Tailwind],
      backend: [TechId.Nestjs, TechId.Postgres, TechId.Prisma],
      infra: [TechId.Docker, TechId.Vite, TechId.Pnpm],
    },
    urlPreview: "https://estonoesunrestaurante.com",
    previewLabel: "Open the app",
    runsOn: "docker · caddy, nestjs, postgres",
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
    id: 4,
    name: "@avatar-generator",
    desc: "A deterministic SVG avatar library: the same seed always gives the same avatar, across eleven styles. A core, one package per style, and renderers for React, Vue, Svelte, Angular and plain HTML.",
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
