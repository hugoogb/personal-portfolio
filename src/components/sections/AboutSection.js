import styles from "../styles/Section.module.css";
import { SectionTitle } from "./SectionTitle.js/index.js";

export function AboutSection() {
	return (
		<section className={styles.section}>
			<SectionTitle>About</SectionTitle>
			<p>Some text</p>
		</section>
	);
}
