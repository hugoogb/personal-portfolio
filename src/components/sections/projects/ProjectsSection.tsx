import { Project } from "@/components/sections/projects/Project";
import { SectionCard } from "@/components/sections/SectionCard";
import { PROJECTS } from "@/constants/projects.constants";

export const ProjectsSection = () => {
  return (
    <SectionCard id="Work" title="Work">
      {/* Rows rather than a card grid: four full-width entries read in priority
          order and keep the section close to one viewport instead of 2.5. */}
      <div className="flex flex-col">
        {PROJECTS.map((project) => (
          <Project key={project.id} {...project} />
        ))}
      </div>
    </SectionCard>
  );
};
