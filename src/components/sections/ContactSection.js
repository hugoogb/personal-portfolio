import styles from "../../styles/modules/Section.module.css";
import { ContactForm } from "../ContactForm";
import { SectionTitle } from "./SectionTitle.js";

export function ContactSection() {
	return (
		<section
			id='contact'
			style={{ marginBottom: "50rem" }}
			className={styles.section}
		>
			<SectionTitle>Contact</SectionTitle>
			<ContactForm></ContactForm>
		</section>
	);
}
