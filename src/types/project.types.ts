import { StaticImageData } from 'next/image';

export interface TechStack {
  frontend: string[];
  backend: string[];
  tools: string[];
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
  src: StaticImageData;
  githubUrl: GitHubUrls;
}

export type ProjectId = Project['id'];
export type ProjectName = Project['name'];