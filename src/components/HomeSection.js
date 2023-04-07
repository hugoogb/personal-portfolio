import styles from "../styles/Section.module.css";
import { SectionTitle } from "./SectionTitle.js";

export function HomeSection() {
	return (
		<section className={styles.section}>
			<SectionTitle>Home</SectionTitle>
			<p>Name (canva font) + Image</p>
		</section>
	);
}
