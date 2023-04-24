import Head from "next/head";
import { PortfolioLayout } from "@/components/PortfolioLayout";

export default function Index() {
	return (
		<>
			<Head>
				<title>Hugo GB | Web Developer</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='description'
					content="Hugo's personal portfolio webpage showing his projects
					 and a description on the work he does and how he does it, 
					 the website also has a contact form and ways to downoald Hugo's resume."
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/apple-touch-icon.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/favicon-32x32.png'
				></link>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/favicon-16x16.png'
				></link>
				<link rel='manifest' href='/site.webmanifest'></link>
				<link rel='canonical' href='https://hugoogb.dev'></link>
			</Head>
			<PortfolioLayout></PortfolioLayout>
		</>
	);
}
