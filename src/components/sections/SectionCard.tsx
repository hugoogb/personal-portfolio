import type { FC, ReactNode } from "react";
import { SectionTitle } from "@/components/sections/SectionTitle";
import styles from "@/styles/modules/Section.module.css";

interface SectionCardProps {
  id?: string;
  title: string;
  memoji: string;
  children?: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({
  id,
  title,
  memoji,
  children,
}) => {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.cardWrapper}>
        <div className={styles.cardContainer}>
          <div className={styles.sectionWrapper}>
            <SectionTitle memoji={memoji}>{title}</SectionTitle>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};
