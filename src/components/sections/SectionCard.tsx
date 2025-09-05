import { SectionTitle } from "@/components/sections/SectionTitle";
import styles from "@/styles/modules/Section.module.css";

interface SectionCardProps {
  title: any;
  memoji: any;
  children: any;
}

export const SectionCard: FC<SectionCardProps> = ({ title, memoji, children  }) => {
	return (
		<section className={styles.section}>
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
