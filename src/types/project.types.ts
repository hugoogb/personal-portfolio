import type { TechId } from "@/constants/icons.constants";

export interface TechStack {
  frontend: TechId[];
  frameworks: TechId[];
  backend: TechId[];
  tools: TechId[];
}

export interface GitHubUrls {
  all: string;
  frontend: string;
  backend: string;
}

export interface Project {
  id: number;
  name: string;
  desc: string;
  techStack: TechStack;
  urlPreview: string;
  src: string;
  githubUrl: GitHubUrls;
  /** Short evidence chips surfaced on the card (endpoints, tests, stack highlights). */
  stats?: string[];
  /** Label shown in place of a source button when the code is intentionally private. */
  closedSource?: string;
}
