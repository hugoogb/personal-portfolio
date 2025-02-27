import { useTranslation } from "react-i18next";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<SEO 
				title={t("head.about.title")}
				description={t("head.about.description")}
				faviconPath="/favicon/about"
				canonicalUrl="https://hugoogb.dev/about"
			/>
			<ErrorBoundary>
				<AboutSection />
			</ErrorBoundary>
		</>
	);
}
