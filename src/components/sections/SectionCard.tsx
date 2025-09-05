import type { FC, ReactNode } from 'react';
import { SectionTitle } from "@/components/sections/SectionTitle";
import styles from "@/styles/modules/Section.module.css";
import type { StaticImageData } from 'next/image';

interface SectionCardProps {
  id?: string;
  title: string;
  memoji: StaticImageData;
  children?: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({ id, title, memoji, children  }) => {
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
