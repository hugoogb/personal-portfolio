import { useTranslation } from "react-i18next";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<SEO 
				title={t("head.projects.title")}
				description={t("head.projects.description")}
				faviconPath="/favicon/projects"
				canonicalUrl="https://hugoogb.dev/projects"
			/>
			<ErrorBoundary>
				<ProjectsSection />
			</ErrorBoundary>
		</>
	);
}
