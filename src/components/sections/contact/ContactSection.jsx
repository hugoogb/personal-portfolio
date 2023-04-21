import styles from "@/styles/modules/Section.module.css";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { ContactForm } from "@/components/sections/contact/ContactForm.jsx";

export function ContactSection() {
	return (
		<section
			id='contact'
			style={{ marginBottom: "20rem" }}
			className={styles.section}
		>
			<SectionTitle>Contact</SectionTitle>
			<ContactForm></ContactForm>
		</section>
	);
}
