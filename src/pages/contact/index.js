import Head from "next/head";
import { useTranslation } from "react-i18next";
import { ContactSection } from "@/components/sections/contact/ContactSection";

export default function Index() {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t("head.contact.title")}</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content={t("head.contact.description")}
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/contact/apple-touch-icon.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/contact/favicon-32x32.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/contact/favicon-16x16.png'
				></link>
				<link
					rel='manifest'
					href='/favicon/contact/site.webmanifest'
				></link>
				<link rel='canonical' href='https://hugoogb.dev/contact'></link>
			</Head>
			<ContactSection></ContactSection>
		</>
	);
}
