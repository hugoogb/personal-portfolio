import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import styles from "@/styles/modules/Section.module.css";

export const SectionCard = ({ title, memoji, children }) => {
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
