import type { FC, ReactNode } from "react";
import { SectionTitle } from "@/components/sections/SectionTitle";
import { motion } from "motion/react";

interface SectionCardProps {
  id?: string;
  title: string;
  children?: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({ id, title, children }) => {
  return (
    <motion.section
      id={id}
      className="section-container min-h-dvh flex flex-col justify-center py-20 sm:py-28 lg:py-32"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-10 sm:space-y-12 lg:space-y-16">
        <SectionTitle>{title}</SectionTitle>
        <div className="animate-slide-up">{children}</div>
      </div>
    </motion.section>
  );
};
