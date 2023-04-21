import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Section.module.css";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { ContactForm } from "@/components/sections/contact/ContactForm.jsx";

export function ContactSection() {
	const { t } = useTranslation();

	return (
		<section
			id={t("nav.contact")}
			style={{ marginBottom: "20rem" }}
			className={styles.section}
		>
			<SectionTitle>{t("contact.title")}</SectionTitle>
			<ContactForm></ContactForm>
		</section>
	);
}
