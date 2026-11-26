import type { TechId } from "@/constants/tech.constants";

export interface TechStack {
  languages: TechId[];
  frontend: TechId[];
  backend: TechId[];
  infra: TechId[];
}

export interface Project {
  name: string;
  desc: string;
  techStack: TechStack;
  urlPreview: string;
  previewLabel?: string;
  status?: string;
  src: string;
  alt: string;
  srcSetWebp?: string;
  repoUrl?: string;
  stats?: string[];
  closedSource?: string;
}
