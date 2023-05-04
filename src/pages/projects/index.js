import Head from "next/head";
import { useTranslation } from "react-i18next";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t("head.projects.title")}</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content={t("head.projects.description")}
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/projects/apple-touch-icon.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/projects/favicon-32x32.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/projects/favicon-16x16.png'
				></link>
				<link
					rel='manifest'
					href='/favicon/projects/site.webmanifest'
				></link>
				<link
					rel='canonical'
					href='https://hugoogb.dev/projects'
				></link>
			</Head>
			<ProjectsSection></ProjectsSection>
		</>
	);
}
