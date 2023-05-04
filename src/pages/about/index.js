import Head from "next/head";
import { useTranslation } from "react-i18next";
import { AboutSection } from "@/components/sections/about/AboutSection";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t("head.about.title")}</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content={t("head.about.description")}
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/about/apple-touch-icon.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/about/favicon-32x32.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/about/favicon-16x16.png'
				></link>
				<link
					rel='manifest'
					href='/favicon/about/site.webmanifest'
				></link>
				<link rel='canonical' href='https://hugoogb.dev/about'></link>
			</Head>
			<AboutSection></AboutSection>
		</>
	);
}
