import { useTranslation } from "react-i18next";
import { HomeSection } from "@/components/sections/home/HomeSection";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<SEO 
				title={t("head.home.title")}
				description={t("head.home.description")}
				faviconPath="/favicon/home"
				canonicalUrl="https://hugoogb.dev"
			/>
			<ErrorBoundary>
				<HomeSection />
			</ErrorBoundary>
		</>
	);
}
