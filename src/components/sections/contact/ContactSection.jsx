import { useTranslation } from "react-i18next";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { ContactForm } from "@/components/sections/contact/ContactForm.jsx";
import memoji from "/public/memojis/image5.png";
import { SectionCard } from "../SectionCard";

export function ContactSection() {
	const { t } = useTranslation();

	return (
		<SectionCard
			id={t("nav.contact")}
			title={t("contact.title")}
			memoji={memoji}
		>
			<ContactForm></ContactForm>
		</SectionCard>
	);
}
