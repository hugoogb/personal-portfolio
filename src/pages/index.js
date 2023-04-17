import { Html } from "next/document.js";
import Head from "next/head";
import { PortfolioLayout } from "../components/PortfolioLayout.js";

export default function Home() {
	return (
		<Html lang='en'>
			<Head>
				<title>hugoogb</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<link rel='icon' href='' />
			</Head>
			<PortfolioLayout></PortfolioLayout>
		</Html>
	);
}
