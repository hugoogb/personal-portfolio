import type { TechId } from "@/constants/icons.constants";

export interface TechStack {
  languages: TechId[];
  frontend: TechId[];
  backend: TechId[];
  infra: TechId[];
}

export interface Project {
  id: number;
  name: string;
  desc: string;
  techStack: TechStack;
  urlPreview: string;
  /** Overrides the "Live Demo" button label - a docs site is not a demo. */
  previewLabel?: string;
  /** Original PNG/JPG, used as the <picture> fallback. */
  src: string;
  /** Responsive WebP candidates ("<url> 640w, <url> 1280w") preferred over `src`. */
  srcSetWebp?: string;
  /** Where the thing actually runs, in machine terms. Rendered in mono. */
  runsOn?: string;
  /** Public repository, when the code is open. */
  repoUrl?: string;
  /** npm package page, for projects published as a library. */
  npmUrl?: string;
  /** Short evidence chips surfaced on the card (scale, architecture, capabilities). */
  stats?: string[];
  /** Label shown in place of a source button when the code is intentionally private. */
  closedSource?: string;
}
