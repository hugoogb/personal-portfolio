import { useTranslation } from "react-i18next";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<SEO 
				title={t("head.contact.title")}
				description={t("head.contact.description")}
				faviconPath="/favicon/contact"
				canonicalUrl="https://hugoogb.dev/contact"
			/>
			<ErrorBoundary>
				<ContactSection />
			</ErrorBoundary>
		</>
	);
}
