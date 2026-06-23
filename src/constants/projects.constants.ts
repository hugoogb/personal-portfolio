import { TechId } from "@/constants/icons.constants";
import type { Project } from "@/types/project.types";

import autodetailingImg from "@/assets/images/autodetailing-es.png";
import avatarGeneratorImg from "@/assets/images/avatar-generator.png";
import f1TrackerImg from "@/assets/images/f1-tracker.png";
import profileKitMeImg from "@/assets/images/profilekit.me.png";
import readledgerImg from "@/assets/images/readledger.png";
import socialsImpactImg from "@/assets/images/socials-impact.png";

export const PROJECTS: Project[] = [
  {
    id: 0,
    name: "autodetailing.es",
    desc: "Informational website for a car detailing company, optimized for SEO and performance.",
    techStack: {
      frontend: [TechId.Tailwind],
      frameworks: [TechId.Astro],
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
    desc: "A framework-agnostic avatar generation library with easy integration and fully customizable options.",
    techStack: {
      frontend: [],
      frameworks: [TechId.Astro],
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
  {
    id: 2,
    name: "Socials Impact",
    desc: "Social media analytics dashboard platform to track growth across YouTube, Twitch, TikTok, and Instagram. Visualize performance metrics, analyze trends, and make data-driven decisions.",
    techStack: {
      frontend: [TechId.Tailwind],
      frameworks: [TechId.React, TechId.Nextjs],
      backend: [TechId.Mongodb],
      tools: [TechId.Vercel],
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
    desc: "A platform to manage your manga book series, track the volumes you own and your reading progress, and see how much you've saved versus buying every book you've read.",
    techStack: {
      frontend: [TechId.Tailwind],
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
    id: 4,
    name: "ProfileKit.me",
    desc: "Create and manage a fully customizable profile page with a public, shareable URL to showcase your bio, images, and links — all in one place.",
    techStack: {
      frontend: [TechId.Tailwind],
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
    id: 5,
    name: "F1 Tracker",
    desc: "Complete Formula 1 history and analytics platform. Explore every season of racing data from 1950 to today with interactive charts, circuit maps, and detailed statistics.",
    techStack: {
      frontend: [TechId.Tailwind],
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
] as const;
