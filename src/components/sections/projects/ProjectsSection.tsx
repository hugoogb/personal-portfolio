import { Project } from "@/components/sections/projects/Project";
import { SectionCard } from "@/components/sections/SectionCard";
import { PROJECTS } from "../../../constants/projects.constants";
import { motion } from "motion/react";

export const ProjectsSection = () => {
  return (
    <SectionCard id="Projects" title="Projects">
      <motion.div
        className="columns-1 sm:columns-2 xl:columns-3 gap-6 sm:gap-8 lg:gap-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {PROJECTS.map((project) => (
          <motion.div
            key={project.id}
            className="break-inside-avoid mb-6 sm:mb-8 lg:mb-10"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <Project {...project} />
          </motion.div>
        ))}
      </motion.div>
    </SectionCard>
  );
};
