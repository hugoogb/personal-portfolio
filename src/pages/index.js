import Head from "next/head";
import { useTranslation } from "react-i18next";
import { HomeSection } from "@/components/sections/home/HomeSection";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t("head.home.title")}</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content={t("head.home.description")}
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/home/apple-touch-icon.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/home/favicon-32x32.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/home/favicon-16x16.png'
				></link>
				<link
					rel='manifest'
					href='/favicon/home/site.webmanifest'
				></link>
				<link rel='canonical' href='https://hugoogb.dev'></link>
			</Head>
			<HomeSection></HomeSection>
		</>
	);
}
