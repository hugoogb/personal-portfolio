import styles from "../../styles/modules/Section.module.css";
import { SectionTitle } from "./SectionTitle.js";

export function AboutSection() {
	return (
		<section id='about' className={styles.section}>
			<SectionTitle>About</SectionTitle>
			<p>Some text</p>
		</section>
	);
}
