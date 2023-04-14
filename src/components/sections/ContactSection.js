import styles from "../../styles/modules/Section.module.css";
import { SectionTitle } from "./SectionTitle.js";

export function ContactSection() {
	return (
		<section className={styles.section}>
			<SectionTitle>Contact</SectionTitle>
			<p>Form with contact</p>
		</section>
	);
}
