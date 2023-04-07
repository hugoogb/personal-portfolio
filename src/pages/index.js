import Head from "next/head";
import { PortfolioLayout } from "../components/PortfolioLayout.js";

export default function Home() {
	return (
		<>
			<Head>
				<title>Personal Portfolio</title>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<PortfolioLayout></PortfolioLayout>
		</>
	);
}
