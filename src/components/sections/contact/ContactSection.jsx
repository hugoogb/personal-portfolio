import { useTranslation } from "react-i18next";
import { SectionTitle } from "@/components/sections/SectionTitle.jsx";
import { ContactForm } from "@/components/sections/contact/ContactForm.jsx";
import memoji from "/public/memojis/image5.png";

export function ContactSection() {
	const { t } = useTranslation();

	return (
		<section
			id={t("nav.contact")}
			style={{ marginBottom: "20rem" }}
			className='section'
		>
			<div className='cardWrapper'>
				<div className='cardContainer'>
					<div className='sectionWrapper'>
						<SectionTitle memoji={memoji}>
							{t("contact.title")}
						</SectionTitle>
						<ContactForm></ContactForm>
					</div>
				</div>
			</div>
		</section>
	);
}
