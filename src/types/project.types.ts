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
  src: string;
  githubUrl: GitHubUrls;
}
