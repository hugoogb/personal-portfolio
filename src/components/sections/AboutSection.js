import styles from "../../styles/modules/Section.module.css";
import { SectionTitle } from "./SectionTitle.js";

export function AboutSection() {
	return (
		<section className={styles.section}>
			<SectionTitle>About</SectionTitle>
			<p>Some text</p>
		</section>
	);
}
